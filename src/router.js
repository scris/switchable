import Vue from 'vue'
import Router from 'vue-router'
import lo from './views/login'
import sw from './views/switchable'
import np from './views/notifypage'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: lo,
    },
    {
      path: '/',
      name: 'switchable',
      component: sw,
    },
    {
      path: '/notifypage',
      name: 'notifypage',
      component: np,
    }
  ]
})
