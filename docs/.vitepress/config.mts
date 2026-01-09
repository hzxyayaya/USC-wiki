import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'
import mark from 'markdown-it-mark'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "USC Wiki",
  description: "一个关于我们学校的百科全书",
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ],
  markdown: {
    config: (md) => {
      md.use(mathjax3)
      md.use(taskLists)
      md.use(footnote)
      md.use(mark)
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '学业', link: '/academics/' },
      { text: '生活', link: '/life/' },
      { text: '资源', link: '/resources/software' },
      { text: '工具', link: '/tools/' }
    ],

    sidebar: {
      '/academics/': [
        {
          text: '教务指南',
          items: [
            { text: '综述', link: '/academics/' },
            { text: '选课攻略', link: '/academics/enrollment' },
            { text: 'GPA 政策', link: '/academics/gpa' }
          ]
        },
        {
          text: '学院导航',
          items: [
            {
              text: '计算机学院',
              link: '/academics/colleges/cs/',
              collapsed: true,
              items: [
                { text: '软件工程', link: '/academics/colleges/cs/SWE' },
                { text: '测试', link: '/academics/colleges/cs/test' },
                { text: 'Markdown 演示', link: '/academics/colleges/cs/markdown-demo' }
              ]
            },
            {
              text: '商学院',
              link: '/academics/colleges/business/',
              collapsed: true
            }
          ]
        }
      ],
      '/life/': [
        {
          text: '校园生活',
          items: [
            { text: '生活综述', link: '/life/' },
            { text: '吃喝出行', link: '/life/campus' },
            { text: '校园网', link: '/life/network' },
            { text: '时间表', link: '/life/xiaoli' }
          ]
        }
      ],
      '/resources/': [
        {
          text: '实用资源',
          items: [
            { text: '软件推荐', link: '/resources/software' },
            { text: '常用模板', link: '/resources/templates' },
            { text: '证书报名', link: '/resources/certificates' }
          ]
        }
      ],
      '/tools/': [
        {
          text: '在线工具',
          items: [
            { text: 'GPA 计算器 ', link: '/tools/compute' },
            { text: '倒计时', link: '/tools/time' },
            { text: '实时 Markdown 编辑器', link: '/tools/md-editor' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    footer: {
      message: '由 VitePress 驱动',
      copyright: 'Copyright © 2025 USC Wiki Team'
    }
  }
})
