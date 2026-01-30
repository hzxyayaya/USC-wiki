import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'
import mark from 'markdown-it-mark'
import fs from 'node:fs'
import path from 'node:path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import wikilinks from './plugins/wikilinks'

// Helper to generate filename -> path map for Wikilinks
// Helper to generate filename -> path map for Wikilinks
function getPermalinks(dir: string, root = '', ignorePublic = true): Record<string, string> {
  let map: Record<string, string> = {}
  try {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        if (file === '.vitepress' || file === 'node_modules' || file.startsWith('.')) continue
        if (ignorePublic && file === 'public') continue

        Object.assign(map, getPermalinks(fullPath, path.join(root, file), ignorePublic))
      } else {
        const webPath = '/' + path.join(root, file).split(path.sep).join('/')
        const nameWithoutExt = path.basename(file, path.extname(file))

        map[nameWithoutExt] = webPath
        map[file] = webPath
      }
    }
  } catch (e) {
    // ignore if dir doesn't exist
  }
  return map
  return map
}

// Helper to find all 'attachment' directories for static copy
function getAttachmentConfigs(dir: string, root = ''): { src: string, dest: string }[] {
  let configs: { src: string, dest: string }[] = []
  try {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        if (file === '.vitepress' || file === 'node_modules' || file.startsWith('.')) continue
        if (file === 'attachment') {
          configs.push({
            src: path.join(fullPath, '*').replace(/\\/g, '/'),
            dest: path.join(root, file).replace(/\\/g, '/')
          })
        } else {
          configs = configs.concat(getAttachmentConfigs(fullPath, path.join(root, file)))
        }
      }
    }
  } catch (e) { }
  return configs
}

const docsDir = path.resolve(__dirname, '../')
const publicDir = path.resolve(docsDir, 'public')

const docsParams = {
  ...getPermalinks(docsDir, '', true),
  ...getPermalinks(publicDir, '', false)
}

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
      md.use(wikilinks, { permalinks: docsParams })
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
            { text: '选课指南', link: '/academics/选课指南' },
            { text: '课程安排', link: '/academics/课程安排' },
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
        },
        {
          text: '课程信息',
          collapsed: true,
          items: [
            { text: '大学生心理健康教育与指导', link: '/academics/course/大学生心理健康教育与指导' },
            { text: '军事技能', link: '/academics/course/军事技能' },
            { text: '大学生职业发展与就业指导', link: '/academics/course/大学生职业发展与就业指导' },
            { text: 'C++ 程序设计', link: '/academics/course/C++程序设计' },
            { text: '计算机科学导论', link: '/academics/course/计算机科学导论' }
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
        },
        {
          text: '课程资源',
          items: [
            { text: '线性代数', link: '/resources/课程资源/线性代数' }
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
      { icon: 'github', link: 'https://github.com/hzxyayaya/USC-wiki' }
    ],

    footer: {
      message: '由 VitePress 驱动',
      copyright: 'Copyright © 2025 USC Wiki Team'
    }
  },
  transformPageData(page) {
    if (!page.title) {
      page.title = path.basename(page.filePath, '.md')
      page.frontmatter.generatedTitle = true
    }
  },
  ignoreDeadLinks: true,
  vite: {
    plugins: [
      viteStaticCopy({
        targets: getAttachmentConfigs(docsDir)
      })
    ]
  }
})
