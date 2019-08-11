<i18n src="@/assets/lang.json"></i18n>
<template>
  <div class="container">
    <b-modal
      id="notswitchableuser"
      ok-only
      :title="$t('confirm')"
      ref="nsumodal"
      :ok-title="$t('submit')"
      @ok="nsulogin">  
      {{ $t('lnotswitchableuser') }} 
    </b-modal>
    <loading :active.sync="loading" :can-cancel="false" :is-full-page="true" loader="bars"></loading>
    <div id="planselectorcontainer" class="linediv">
      <div v-if="iselectron" class="btn logintitle">Switchable login</div>
      <div class="btn closewindowcontainer" style="-webkit-app-region: no-drag; -webkit-user-select: none">
        <a v-if="iselectron" class="btn bfa closewindow topicon btn-light" href="javascript:window.close()"><i class="fa fa-times"></i></a>
      </div>
    </div>
    <div class="login">
      <div class="linediv"><b-input id="emailinput" v-model="email" type="email" required :placeholder="$t('lemail')"></b-input></div>
      <div class="linediv"><b-input id="pwdinput" v-model="pwd" required :placeholder="$t('lpassword')" type="password"></b-input></div>
      <div class="bold">
        <b-btn @click="login" class="button loginbtn dropdown-item">{{ $t('llogin') }}</b-btn>
        <b-btn @click="reg" class="button loginbtn dropdown-item">{{ $t('lregister') }}</b-btn>
      </div>
      <b-modal id="noticer" ok-only ref="nvmodal" @ok="noticed">
          {{ $t('lpermission') }}
      </b-modal>
    </div>
    <div class="linediv">
      <b-btn class="dropdown-item langitem" @click="i18nchinese">中文</b-btn>
      <b-btn class="dropdown-item" @click="i18nenglish">English</b-btn>
    </div>
    <div class="linediv">
      <b-btn class="dropdown-item" @click="continueanonymous">{{ $t('lcontinueanonymous') }}</b-btn>
    </div>
  </div>
</template>
<!--We need to notice that on iOS, if you don't login, your data can be vanished only because of the limitation of iOS.(or update to at least 12.2)-->

<script>
import AV from 'leancloud-storage';
var apijson = require("@/assets/leancloud.json")
var y364rdef43id = apijson.u5dfsg53452hfc43cdid;
var t43refwdskey = apijson.f653fdsh453refdslkey;
var ht5grfvfr5re = '';
if (apijson.du23453dcxe4trefsdre == "yes") ht5grfvfr5re = 'us';
else ht5grfvfr5re = '';
AV.init({
	appId: y364rdef43id,
	appKey: t43refwdskey,
	region: ht5grfvfr5re,
});
var Plan = AV.Object.extend('switchable_plans');
var Oncetask = AV.Object.extend('switchable_oncetasks');

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import Loading from 'vue-loading-overlay';

export default {
  name: 'login',
  components: {
    Loading,
  },
  data() {
    return {
      email: '',
      pwd: '',
      nvisibility: false,
      lang: 'en',
      confirmlogin: false, 
      iselectron: false,
      loading: false,
      plans: [],
      oncetask: [],
    };
  },
  watch: {
      async lang (val) {
        this.storagesetlang(val);
        this.$i18n.locale = val;
      }
  },
  mounted: function() {
    this.i18nsetlang();
    this.storagegetdata();
    if(process.env.VUE_APP_LINXF == 'electron') {
      this.iselectron = true;
    }
  },
  methods: {
    async storagesetlang(val) {
      await Storage.set({
        key: 'lang',
        value: val
      });
    },
    async i18nsetlang() {
      const keys = await Storage.keys();
      if(keys.keys.indexOf('lang') != -1) {
        const retlang = await Storage.get({ key:'lang' });
        if(retlang.value != null) this.lang = retlang.value;
        else this.lang = 'en', this.storagesetlang('en');
      } else {
        this.lang = 'en';
        this.storagesetlang('en');
      }
      this.$i18n.locale = this.lang;
    },
    i18nchinese() {
      this.lang = 'cn';
    },
    i18nenglish() {
      this.lang = 'en';
    },
    continueanonymous() {
      this.$router.push('/');
      this.confirmlogin = false;
    },
    reg() {
      var that = this;
      this.loading = true;
      var user = new AV.User();
      user.setUsername(that.email);
      user.setPassword(that.pwd);
      user.set('isUserOfSwitchable',true);
      user.signUp().then(function (loginedUser) {
        var plan = new Plan();
        plan.set('name', 'Default');
        plan.set('tasks', []);
        plan.set('index', 1);
        plan.set('type', 'absolute');
        plan.set('user', AV.User.current());
        plan.save().then(function (pl) {
          if (process.env.VUE_APP_LINXF == 'capacitor') {
            cordova.plugins.notification.local.hasPermission(function (granted) {
              if (granted) {
                that.whenlogin();
              } else {
                that.loading = false;
                that.$refs['nvmodal'].show();
              }
            });
          } else if (process.env.VUE_APP_LINXF != 'electron') {
            if ('Notification' in window) {
              if(Notification.permission == 'granted') {
                that.whenlogin();
              } else {
                Notification.requestPermission(function(permission) {
                  that.whenlogin();
                });
              }
            } else {
              that.whenlogin();
            }
          } else {
            that.whenlogin();
          } 
        }, function (error) {
          that.loading = false;
          alert(error.rawMessage);
        });
      }, (function (error) {
        that.loading = false;
        alert(error.rawMessage);
      }));
    },
    login() {
      this.loading = true;
      var that = this;
      AV.User.logIn(that.email, that.pwd).then(function (loginedUser) {
        if (process.env.VUE_APP_LINXF == 'capacitor') {
          cordova.plugins.notification.local.hasPermission(function (granted) {
            if (granted) {
              that.whenlogin();
            } else {
              that.loading = false;
              that.$refs['nvmodal'].show();
            }
          });
        } else if (process.env.VUE_APP_LINXF != 'electron') {
          if ('Notification' in window) {
            if(Notification.permission == 'granted'){
              that.whenlogin();
            } else {
              Notification.requestPermission(function(permission) {
                that.whenlogin();
              });
            }
          } else {
            that.whenlogin();
          }
        } else {
          that.whenlogin();
        }
      }, function (error) {
        alert(error.rawMessage);
        that.loading = false;
      });
    },
    noticed() {
      var that = this;
      cordova.plugins.notification.local.requestPermission(function (granted) {
        that.loading = false;
        that.$router.push('/');
      });
    },
    nsuintologin() {
      this.loading = false;
      this.$router.push('/');
      this.confirmlogin = true;
    },
    nsulogin() {
      var that = this;
      this.plans.map((item, index) => {
        var plan = new Plan();
        plan.set('name', item.name);
        plan.set('tasks',item.tasks)
        plan.set('type', item.type);
        plan.set('user', AV.User.current());
        plan.set('index', item.index);
        plan.save().then(function (pl) {
          
        }, function (error) {
          alert(error.rawMessage);
        });
      });
      that.oncetask.map((item, index) => {
        var oncetask = new Oncetask();
        oncetask.set('name', item.name);
        oncetask.set('time', item.time);
        oncetask.set('finished',item.finished)
        oncetask.set('plan', item.plan.toString());
        oncetask.set('user', AV.User.current());
        oncetask.save().then(function (pl) {
          var user = AV.User.current();
          user.set('isUserOfSwitchable', true);
          user.save().then(function (user) {});
          that.nsuintologin();
        }, function (error) {
          alert(error.rawMessage);
        });
      });
    },
    whenlogin() {
      this.conflictsolver();
    },
    conflictsolver() {
      if(!AV.User.current().get('isUserOfSwitchable')) {
        this.$refs['nsumodal'].show();
      } else {

      }
    },
    async storagegetdata() {
      const keys = await Storage.keys();
      if(keys.keys.indexOf('plan') != -1) {
        const splan = await Storage.get({ key:'plan' })
        this.plans = JSON.parse(splan.value);
      }
      if(keys.keys.indexOf('oncetask') != -1) {
        const sotask = await Storage.get({ key:'oncetask' })
        this.oncetask = JSON.parse(sotask.value);
      }
    },
  },
};
</script>
