import Vue from 'vue'
import App from './App.vue'
// ui库
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
Vue.use(MuseUI);
// FastClick
import FastClick from 'fastclick'
FastClick.attach(document.body)
// flexible
import '../public/js/flexible.js'
// Roboto fonts
// <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
import './Roboto/Roboto_300,400,500,700,400italic.css'
// Material Design icons
// <link rel="stylesheet" href="https://cdn.bootcss.com/material-design-icons/3.0.1/iconfont/material-icons.css">
import './material-design-icons/3.0.1/iconfont/material-icons.css'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
