import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/fontawesome/css/all.css'
import './assets/css.css'

import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)

Vue.config.productionTip = false
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error Handler:\n'+error+'\n'+vm+'\n'+info+'\n');
}

import VueCordova from 'vue-cordova' 
Vue.use(VueCordova) 
if (window.location.protocol === 'file:' || window.location.port === '3000') {
  var cordovaScript = document.createElement('script') 
  cordovaScript.setAttribute('type', 'text/javascript') 
  cordovaScript.setAttribute('src', 'cordova.js') 
  document.body.appendChild(cordovaScript) 
} 
Vue.cordova.on('deviceready', () => {
  
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

