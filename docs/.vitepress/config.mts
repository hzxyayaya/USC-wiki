import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "USC Wiki",
  description: "一个关于我们学校的百科全书",
  markdown: {
    config: (md) => {
      md.use(mathjax3)
      md.use(taskLists)
      md.use(footnote)
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '新生', link: '/new-student/' },
      { text: '学业', link: '/academics/' },
      { text: '生活', link: '/life/' },
      { text: '资源', link: '/resources/software' },
      { text: '出路', link: '/career/' },
      { text: '工具', link: '/tools/' }
    ],

    sidebar: {
      '/new-student/': [
        {
          text: '新生入学',
          items: [
            { text: '入学清单', link: '/new-student/' }
          ]
        }
      ],
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
            { text: '计算机学院', link: '/academics/colleges/cs/' },
            { text: '商学院', link: '/academics/colleges/business/' }
          ]
        }
      ],
      '/life/': [
        {
          text: '校园生活',
          items: [
            { text: '生活综述', link: '/life/' },
            { text: '吃喝出行', link: '/life/campus' },
            { text: '校园网', link: '/life/network' }
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
      '/career/': [
        {
          text: '升学就业',
          items: [
            { text: '规划概览', link: '/career/' }
          ]
        }
      ],
      '/tools/': [
        {
          text: '在线工具',
          items: [
            { text: 'GPA 计算器 & 倒计时', link: '/tools/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    footer: {
      message: '由 VitePress 强力驱动',
      copyright: 'Copyright © 2025 USC Wiki Team'
    }
  }
})
