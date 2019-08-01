<i18n src="@/assets/lang.json"></i18n>
<template>
  <div class="container">
    <div class="login">
      <b-input id="emailinput" v-model="email" type="email" required :placeholder="$t('lemail')"></b-input><br>
      <b-input id="pwdinput" v-model="pwd" required :placeholder="$t('lpassword')" type="password"></b-input>
      <div class="bold">
        <b-btn @click="login" class="button loginbtn dropdown-item">{{ $t('llogin') }}</b-btn>
        <b-btn @click="reg" class="button loginbtn dropdown-item">{{ $t('lregister') }}</b-btn>
      </div>
      <b-modal id="noticer" ok-only :visible="nvisibility" @ok="noticed">
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
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

export default {
  name: 'login',
  data() {
    return {
      email: '',
      pwd: '',
      nvisibility: false,
      lang: 'en',
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
    },
    reg() {
      var that = this;
      var user = new AV.User();
      user.setUsername(that.email);
      user.setPassword(that.pwd);
      user.signUp().then(function (loginedUser) {
        var plan = new Plan();
        plan.set('name', 'Default');
        plan.set('tasks', []);
        plan.set('index', 1);
        plan.set('type', 'absolute');
        plan.set('user', AV.User.current());
        var that = this;
        plan.save().then(function (pl) {
          if (process.env.VUE_APP_LINXF == 'capacitor') {
            cordova.plugins.notification.local.hasPermission(function (granted) {
              if (granted) {
                alert("Now Log In");
              } else {
                that.nvisibility = true;
              }
            });
          } else if (process.env.VUE_APP_LINXF != 'electron'){
            if(Notification.permission != 'granted'){
              if(!('Notification' in window) ){
                  alert('Please turn to a modern browser to use Scris Switchable.');
                  return;
              }
              Notification.requestPermission(function(permission) {
                alert("Now Log In");
              });
            } else {
              alert("Now Log In");
            }
          } else {
            alert("Now Log In");
          }
        }, function (error) {
          alert(error.rawMessage);
        });
      }, (function (error) {
        alert(error.rawMessage);
      }));
    },
    login() {
      var that = this;
      AV.User.logIn(that.email, that.pwd).then(function (loginedUser) {
        if (process.env.VUE_APP_LINXF == 'capacitor') {
          cordova.plugins.notification.local.hasPermission(function (granted) {
            if (granted) {
              that.$router.push('/');
            } else {
              that.nvisibility = true;
            }
          });
        } else if (process.env.VUE_APP_LINXF != 'electron') {
          if(Notification.permission != 'granted'){
            if(!('Notification' in window) ){
                alert('Please turn to a modern browser to use Scris Switchable.');
                that.$router.push('/');
             }
             Notification.requestPermission(function(permission) {
                 that.$router.push('/');
             });
           } else {
             that.$router.push('/');
           }
        } else {
          that.$router.push('/'); 
        }
      }, function (error) {
        alert(JSON.stringify(error));
      });
    },
    noticed() {
      var that = this;
      cordova.plugins.notification.local.requestPermission(function (granted) {
        that.$router.push('/');
      });
    },
  },
};
</script>
