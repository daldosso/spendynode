import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import 'vuetify/dist/vuetify.min.css'
// import Vuetify from 'vuetify'
// import theme from './plugins/theme'

// import '@mdi/font/css/materialdesignicons.css'
// import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false


// Vue.use(Vuetify, {
//   iconfont: 'mdi',
//   theme
// })

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
