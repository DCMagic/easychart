// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import 'es6-promise/auto'
import store from "./store/store"
import 'vue-easytable/libs/themes-base/index.css'
import {VTable,VPagination} from 'vue-easytable'
import 'material-icons/iconfont/material-icons.css';

import Vuesax from 'vuesax'
import 'vuesax/dist/vuesax.css' //Vuesax styles

window.$ = require('jquery')

Vue.use(Vuesax)
Vue.use(ElementUI);
Vue.config.productionTip = false
Vue.component(VTable.name, VTable)
Vue.component(VPagination.name, VPagination)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store, //vuex store
  components: { App },
  template: '<App/>'
})
