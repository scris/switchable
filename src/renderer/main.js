import Vue from 'vue/dist/vue.esm.js'
import App from './App'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
 
import BootstrapVue from 'bootstrap-vue'
 
Vue.use(BootstrapVue)

Vue.config.productionTip = false;
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
