// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import type { App } from 'vue'
import GPACalculator from '../components/GPACalculator.vue'
import Countdown from '../components/Countdown.vue'
import HomeEnhancement from '../components/HomeEnhancement.vue'
import LiveEditor from '../components/LiveEditor.vue'
import ComingSoon from '../components/ComingSoon.vue'
import './tailwind.css'
import './custom.css'
export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    // 注册全局组件
    app.component('GPACalculator', GPACalculator)
    app.component('Countdown', Countdown)
    app.component('HomeEnhancement', HomeEnhancement)
    app.component('LiveEditor', LiveEditor)
    app.component('ComingSoon', ComingSoon)
  }
}

