import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '@/App.vue'
import Scrollable from '@/views/Scrollable.vue'
import Positioning from '@/views/Positioning.vue'
import Grid from '@/views/Grid.vue'

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue"

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(VueRouter)

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/scrollable",
      component: Scrollable,
    },
    {
      path: "/positioning",
      component: Positioning,
    },
    {
      path: "/grid",
      component: Grid,
    },
  ],
})

Vue.config.productionTip = false
Vue.config.devtools = true

/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  render: h => h(App),
})
