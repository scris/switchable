<!--<template>
  <div class="container">
      <b-nav>
        <b-nav-item active @click="tologin">Login</b-nav-item>
        <b-nav-item @click="toregister">Register</b-nav-item>
      </b-nav>
      <b-form @submit="submit">
        <b-form-group id="emailgroup" label="Email address:" label-for="emailinput" description="We'll never share your email with anyone else.">
          <b-input id="emailinput" v-model="form.email" type="email" required placeholder="Enter email"></b-input>
        </b-form-group>
        <b-form-group id="pwdgroup" label="Your Password:" label-for="pwdinput">
          <b-input id="pwdinput" v-model="form.pwd" required placeholder="Enter password" type="password"></b-input>
        </b-form-group>
        <b-button type="submit" variant="primary">{{ this.btnword }}</b-button>
      </b-form>
  </div>
</template>

<script>
import AV from 'leancloud-storage';
var APP_ID = 'C7SVWNehvavYoUH5cssIKYDH-MdYXbMMI';
var APP_KEY = 'nJ2QMhw8deT5QwNt40rjsaK7';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY,
  region: 'us'
});

export default {
  name: 'login',
  data() {
      return {
        form: {
          email: '',
          pwd: '',
        },
      btnword: 'Login',
    };
  },
  methods: {
    tologin() {
        this.btnword = "Login";
    },
    toregister() {
        this.btnword = "Register";
    },
    submit() {
        if(this.btnword == "Login") this.login();
        else this.register();
    },
    register() {
        var that = this;
        var user = new AV.User();
        user.setUsername(that.form.email);
        user.setPassword(that.form.pwd);
        user.signUp().then(function (loginedUser) {
            that.$router.push('i'); 
        }, (function (error) {
            alert(JSON.stringify(error));
        }));
    },
    login() {
                var that = this;
        AV.User.logIn(that.form.email, that.form.pwd).then(function (loginedUser) {
            that.$router.push('/i'); 
        }, function (error) {
            alert(JSON.stringify(error));
        });
      
        },
    },
}
</script>-->
<template>
  <div id="container">
    <b-input id="emailinput" v-model="email" type="email" required placeholder="Enter email"></b-input><br>
    <b-input id="pwdinput" v-model="pwd" required placeholder="Enter password" type="password"></b-input>
    <b-button @click="login" class="button loginbtn">Login</b-button>&nbsp;&nbsp;
    <b-button @click="reg" class="button loginbtn">Register</b-button>
    <b-modal id="noticer" ok-only :visible="nvisibility" @ok="noticed">
        Now we will ask for permission to send you notifications. Please allow this, or we won't be able to notice you that it's time to start working on your tasks.
    </b-modal>
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

export default {
  name: 'login',
  data() {
    return {
      email: '',
      pwd: '',
      nvisibility: false,
    };
  },
  methods: {
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
          if (process.env.VUE_APP_LINXF == 'cordova') {
            cordova.plugins.notification.local.hasPermission(function (granted) {
              if (granted) {
                that.$router.push('i');
              } else {
                that.nvisibility = true;
              }
            });
          } else if (process.env.VUE_APP_LINXF == 'web'){
            if(Notification.permission != 'granted'){
              if(!('Notification' in window) ){
                  alert('Please turn to a modern browser to use Scris Switchable.');
                  return;
              }
              Notification.requestPermission(function(permission) {
                that.$router.push('i');
              });
            } else {
              that.$router.push('i');
            }
          } else {
            that.$router.push('i'); 
          }
        }, function (error) {
          console.error(error);
        });
      }, (function (error) {
        alert(JSON.stringify(error));
      }));
    },
    login() {
      var that = this;
      AV.User.logIn(that.email, that.pwd).then(function (loginedUser) {
        if (process.env.VUE_APP_LINXF == 'cordova') {
          cordova.plugins.notification.local.hasPermission(function (granted) {
            if (granted) {
              that.$router.push('i');
            } else {
              that.nvisibility = true;
            }
          });
        } else if (process.env.VUE_APP_LINXF != 'electron') {
          if(Notification.permission != 'granted'){
            if(!('Notification' in window) ){
                alert('Please turn to a modern browser to use Scris Switchable.');
                return;
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
      cordova.plugins.notification.local.requestPermission(function (granted) {
        this.$router.push('i');
      });
    },
  },
};
</script>
