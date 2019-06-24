import Vue from 'vue'
import Router from 'vue-router'
import lo from '@/components/login'
import sw from '@/components/switchable'

Vue.use(Router);

export default new Router({
  routes: [
    /*{
      path: '/',
      name: 'login',
      component: lo,
    },
    {
      path: '/i',
      name: 'switchable',
      component: sw,
    },*/
    {
      path: '/',
      name: 'switchable',
      component: sw,
    },
  ]
})
