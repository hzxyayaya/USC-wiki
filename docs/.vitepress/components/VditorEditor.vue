<template>
  <div class="vditor-editor-wrapper" :class="{ 'fullscreen': isFullscreen }">
    <!-- 自定义工具栏 -->
    <div class="custom-toolbar">
      <!-- 基础格式 -->
      <div class="toolbar-group">
        <span class="group-label">格式</span>
        <button class="toolbar-btn" @click="insert('**', '**')" title="粗体 (Ctrl+B)">
          <strong>B</strong>
        </button>
        <button class="toolbar-btn" @click="insert('*', '*')" title="斜体 (Ctrl+I)">
          <em>I</em>
        </button>
        <button class="toolbar-btn" @click="insert('~~', '~~')" title="删除线">
          <s>S</s>
        </button>
        <button class="toolbar-btn" @click="insert('==', '==')" title="高亮">
          <span class="highlight-icon">H</span>
        </button>
        <button class="toolbar-btn" @click="insert('`', '`')" title="行内代码">
          <code>&lt;/&gt;</code>
        </button>
      </div>

      <!-- 标题 -->
      <div class="toolbar-group">
        <span class="group-label">标题</span>
        <button class="toolbar-btn" @click="insertLine('# ')" title="一级标题">H1</button>
        <button class="toolbar-btn" @click="insertLine('## ')" title="二级标题">H2</button>
        <button class="toolbar-btn" @click="insertLine('### ')" title="三级标题">H3</button>
      </div>

      <!-- 列表 -->
      <div class="toolbar-group">
        <span class="group-label">列表</span>
        <button class="toolbar-btn" @click="insertLine('- ')" title="无序列表">•</button>
        <button class="toolbar-btn" @click="insertLine('1. ')" title="有序列表">1.</button>
        <button class="toolbar-btn" @click="insertLine('- [ ] ')" title="任务列表">☐</button>
        <button class="toolbar-btn" @click="insertLine('- [x] ')" title="已完成任务">☑</button>
      </div>

      <!-- VitePress 提示框（仅插入语法，导出后可渲染） -->
      <div class="toolbar-group">
        <span class="group-label">VitePress</span>
        <button class="toolbar-btn tip-btn" @click="insertContainer('info', '信息')" title="信息框">
          ℹ️
        </button>
        <button class="toolbar-btn tip-btn" @click="insertContainer('tip', '提示')" title="提示框">
          💡
        </button>
        <button class="toolbar-btn warning-btn" @click="insertContainer('warning', '警告')" title="警告框">
          ⚠️
        </button>
        <button class="toolbar-btn danger-btn" @click="insertContainer('danger', '危险')" title="危险框">
          🚫
        </button>
        <button class="toolbar-btn" @click="insertContainer('details', '点击展开')" title="折叠块">
          📂
        </button>
      </div>

      <!-- 插入 -->
      <div class="toolbar-group">
        <span class="group-label">插入</span>
        <button class="toolbar-btn" @click="insertLink" title="链接">🔗</button>
        <button class="toolbar-btn" @click="insertImage" title="图片">🖼️</button>
        <button class="toolbar-btn" @click="insertTable" title="表格">📊</button>
        <button class="toolbar-btn" @click="insertCodeBlock" title="代码块">📝</button>
        <button class="toolbar-btn" @click="insertLine('---\n')" title="分隔线">—</button>
      </div>

      <!-- 数学公式 -->
      <div class="toolbar-group">
        <span class="group-label">公式</span>
        <button class="toolbar-btn" @click="insert('$', '$')" title="行内公式">
          <span style="font-style: italic;">x²</span>
        </button>
        <button class="toolbar-btn" @click="insertMathBlock" title="公式块">
          <span style="font-style: italic;">∑</span>
        </button>
      </div>

      <!-- 特殊 -->
      <div class="toolbar-group">
        <span class="group-label">其他</span>
        <button class="toolbar-btn" @click="insertLine('> ')" title="引用">❝</button>
        <button class="toolbar-btn" @click="insertFootnote" title="脚注">
          <sup style="font-size: 10px;">注</sup>
        </button>
        <button class="toolbar-btn" @click="insertKbd" title="键盘按键">⌨️</button>
        <button class="toolbar-btn" @click="showEmojiPicker = !showEmojiPicker" title="Emoji">😊</button>
      </div>

      <!-- 操作 -->
      <div class="toolbar-group toolbar-right">
        <button class="toolbar-btn action-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏编辑'">
          {{ isFullscreen ? '⛶ 退出' : '⛶ 全屏' }}
        </button>
        <button class="toolbar-btn export-btn" @click="exportMarkdown" title="导出 Markdown">
          📥 导出
        </button>
      </div>
    </div>

    <!-- Emoji 选择器 -->
    <div class="emoji-picker" v-show="showEmojiPicker">
      <button v-for="emoji in emojis" :key="emoji" class="emoji-btn" @click="insertEmoji(emoji)">
        {{ emoji }}
      </button>
    </div>

    <!-- 编辑器主体 -->
    <div class="editor-body" :class="{ 'split-view': isFullscreen }">
      <!-- 左侧：代码编辑器 -->
      <div class="editor-pane" :class="{ 'half-width': isFullscreen }">
        <div class="pane-header" v-if="isFullscreen">
          <span>📝 Markdown</span>
        </div>
        <div id="vditor" class="vditor-container"></div>
      </div>
      
      <!-- 右侧：VitePress 风格预览（仅全屏模式） -->
      <div class="preview-pane" v-if="isFullscreen">
        <div class="pane-header">
          <span>👁️ VitePress 预览</span>
        </div>
        <div class="preview-content vp-doc" ref="previewRef" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Vditor from 'vditor'
import MarkdownIt from 'markdown-it'
import markdownItMark from 'markdown-it-mark'
import markdownItTaskLists from 'markdown-it-task-lists'
import markdownItFootnote from 'markdown-it-footnote'
import katex from 'katex'
import { codeToHtml } from 'shiki'
import 'vditor/dist/index.css'
import 'katex/dist/katex.min.css'

// 状态
let vditor: Vditor | null = null
const isFullscreen = ref(false)
const showEmojiPicker = ref(false)
const renderedHtml = ref('')
const previewRef = ref<HTMLElement | null>(null)

// 代码块缓存
const codeBlockCache = new Map<string, string>()

// markdown-it 实例
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})
md.use(markdownItMark)
md.use(markdownItTaskLists, { enabled: true, label: true, labelAfter: true })
md.use(markdownItFootnote)

// 渲染数学公式 - 使用占位符方式避免被 markdown-it 破坏
const renderMath = (content: string): { content: string; formulas: string[] } => {
  const formulas: string[] = []
  
  // 先处理块级公式 $$...$$
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const index = formulas.length
    try {
      formulas.push(`<div class="math-block">${katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false
      })}</div>`)
    } catch (e) {
      formulas.push(`<div class="math-block math-error">${formula}</div>`)
    }
    return `\nMATHBLOCK${index}ENDMATH\n`
  })
  
  // 处理行内公式 $...$
  content = content.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    const index = formulas.length
    try {
      formulas.push(katex.renderToString(formula, {
        displayMode: false,
        throwOnError: false
      }))
    } catch (e) {
      formulas.push(`<span class="math-error">${formula}</span>`)
    }
    return `MATHINLINE${index}ENDMATH`
  })
  
  return { content, formulas }
}

// 恢复数学公式
const restoreMath = (html: string, formulas: string[]): string => {
  formulas.forEach((formula, index) => {
    // 块级公式 - 可能被 <p> 包裹
    html = html.replace(`<p>MATHBLOCK${index}ENDMATH</p>`, formula)
    html = html.replace(`MATHBLOCK${index}ENDMATH`, formula)
    // 行内公式
    html = html.replace(`MATHINLINE${index}ENDMATH`, formula)
  })
  return html
}

// 自定义 VitePress 容器渲染
const renderVitePressContainers = (content: string): string => {
  // 处理 ::: type title 容器
  const containerRegex = /:::\s*(tip|warning|danger|info|details)\s*(.*?)\n([\s\S]*?):::/g
  
  return content.replace(containerRegex, (match, type, title, innerContent) => {
    const titleText = title.trim() || type.charAt(0).toUpperCase() + type.slice(1)
    
    if (type === 'details') {
      return `<details class="details custom-block">
        <summary>${titleText}</summary>
        ${md.render(innerContent.trim())}
      </details>`
    }
    
    return `<div class="custom-block ${type}">
      <p class="custom-block-title">${titleText}</p>
      ${md.render(innerContent.trim())}
    </div>`
  })
}

// 处理代码块高亮（异步）
const highlightCodeBlocks = async (html: string): Promise<string> => {
  // 匹配 markdown-it 生成的代码块
  const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g
  const matches = [...html.matchAll(codeBlockRegex)]
  
  for (const match of matches) {
    const [fullMatch, lang, code] = match
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
    
    // 使用缓存避免重复渲染
    const cacheKey = `${lang}:${decodedCode}`
    let highlighted = codeBlockCache.get(cacheKey)
    
    if (!highlighted) {
      try {
        highlighted = await codeToHtml(decodedCode, {
          lang: lang || 'text',
          theme: 'github-dark'
        })
        codeBlockCache.set(cacheKey, highlighted)
      } catch (e) {
        // 如果语言不支持，使用纯文本
        highlighted = `<pre class="shiki"><code>${code}</code></pre>`
      }
    }
    
    html = html.replace(fullMatch, highlighted)
  }
  
  // 处理没有语言标记的代码块
  const plainCodeRegex = /<pre><code>([\s\S]*?)<\/code><\/pre>/g
  html = html.replace(plainCodeRegex, '<pre class="shiki"><code>$1</code></pre>')
  
  return html
}

// 渲染 Markdown 为 HTML（异步）
const renderMarkdown = async (content: string): Promise<string> => {
  // 1. 先提取数学公式，用占位符替换
  const { content: contentWithPlaceholders, formulas } = renderMath(content)
  
  // 2. 处理 VitePress 容器
  let processedContent = renderVitePressContainers(contentWithPlaceholders)
  
  // 3. 分割内容，保护已渲染的 HTML 块
  const containerPattern = /(<div class="custom-block[\s\S]*?<\/div>|<details[\s\S]*?<\/details>)/g
  const parts = processedContent.split(containerPattern)
  
  processedContent = parts.map(part => {
    // 跳过已处理的 HTML 块
    if (part.startsWith('<div class="custom-block') || 
        part.startsWith('<details')) {
      return part
    }
    return md.render(part)
  }).join('')
  
  // 4. 恢复数学公式
  processedContent = restoreMath(processedContent, formulas)
  
  // 5. 代码块高亮
  processedContent = await highlightCodeBlocks(processedContent)
  
  return processedContent
}

// 更新预览
const updatePreview = async () => {
  if (vditor && isFullscreen.value) {
    const content = vditor.getValue()
    renderedHtml.value = await renderMarkdown(content)
  }
}

// 常用 Emoji
const emojis = [
  '🎓', '📚', '💻', '📝', '✅', '❌', '⚠️', '💡',
  '🚀', '🎉', '👍', '👎', '❤️', '⭐', '🔥', '✨',
  '📌', '🔗', '📧', '📍', '🏫', '👨‍🏫', '📖', '🎯',
  '🍜', '☕', '🎮', '🎵', '📅', '⏰', '💰', '🔑'
]

// 主题观察器
let themeObserver: MutationObserver | null = null

// 获取当前主题
const isDarkMode = () => {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark')
  }
  return false
}

// 同步主题到 Vditor
const syncTheme = () => {
  if (vditor) {
    const dark = isDarkMode()
    vditor.setTheme(
      dark ? 'dark' : 'classic',
      dark ? 'dark' : 'light',
      'github-dark'  // 始终使用 github-dark 代码高亮主题
    )
  }
}

// 插入包裹文本
const insert = (before: string, after: string) => {
  if (vditor) {
    const selection = vditor.getSelection() || '文本'
    vditor.insertValue(`${before}${selection}${after}`)
  }
  showEmojiPicker.value = false
}

// 插入行首内容
const insertLine = (prefix: string) => {
  if (vditor) {
    vditor.insertValue(`\n${prefix}`)
  }
  showEmojiPicker.value = false
}

// 插入 VitePress 容器
const insertContainer = (type: string, title: string) => {
  if (vditor) {
    vditor.insertValue(`\n::: ${type} ${title}\n在这里输入内容...\n:::\n`)
  }
  showEmojiPicker.value = false
}

// 插入链接
const insertLink = () => {
  if (vditor) {
    vditor.insertValue('[链接文字](https://)')
  }
  showEmojiPicker.value = false
}

// 插入图片
const insertImage = () => {
  if (vditor) {
    vditor.insertValue('![图片描述](图片链接)')
  }
  showEmojiPicker.value = false
}

// 插入表格
const insertTable = () => {
  if (vditor) {
    vditor.insertValue(`
| 列1 | 列2 | 列3 |
| :--- | :---: | ---: |
| 左对齐 | 居中 | 右对齐 |
| 内容 | 内容 | 内容 |
`)
  }
  showEmojiPicker.value = false
}

// 插入代码块
const insertCodeBlock = () => {
  if (vditor) {
    vditor.insertValue('\n```javascript\n// 在这里输入代码\n```\n')
  }
  showEmojiPicker.value = false
}

// 插入数学公式块
const insertMathBlock = () => {
  if (vditor) {
    vditor.insertValue('\n$$\nx = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$\n')
  }
  showEmojiPicker.value = false
}

// 插入脚注
const insertFootnote = () => {
  if (vditor) {
    vditor.insertValue('[^1]\n\n[^1]: 脚注内容')
  }
  showEmojiPicker.value = false
}

// 插入键盘按键
const insertKbd = () => {
  if (vditor) {
    vditor.insertValue('<kbd>Ctrl</kbd> + <kbd>C</kbd>')
  }
  showEmojiPicker.value = false
}

// 插入 Emoji
const insertEmoji = (emoji: string) => {
  if (vditor) {
    vditor.insertValue(emoji)
  }
  showEmojiPicker.value = false
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    // 进入全屏时更新预览
    setTimeout(updatePreview, 100)
  }
}

// 导出 Markdown
const exportMarkdown = () => {
  if (vditor) {
    const content = vditor.getValue()
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }
}

onMounted(() => {
  const dark = isDarkMode()
  
  vditor = new Vditor('vditor', {
    height: 'auto',
    minHeight: 500,
    width: '100%',
    mode: 'ir',
    theme: dark ? 'dark' : 'classic',
    icon: 'material',
    placeholder: '开始编写你的 Markdown 内容...\n\n支持 VitePress 提示框、数学公式、代码高亮等功能',
    toolbar: [],
    preview: {
      theme: {
        current: dark ? 'dark' : 'light',
      },
      markdown: {
        toc: true,
        mark: true,
        footnotes: true,
        autoSpace: true,
      },
      math: {
        engine: 'MathJax',
        inlineDigit: true,
      },
      hljs: {
        lineNumber: true,
        style: 'github-dark',
      },
    },
    counter: {
      enable: true,
      type: 'text',
    },
    cache: {
      enable: true,
      id: 'usc-wiki-vditor',
    },
    input: () => {
      updatePreview()
    },
    after: () => {
      vditor?.setValue(`# 欢迎使用 USC Wiki Markdown 编辑器

这是专为 USC Wiki 定制的 Markdown 编辑器，全屏模式下可查看 VitePress 风格预览。

## 支持的功能

### 基础格式

- **粗体**、*斜体*、~~删除线~~、==高亮==
- \`行内代码\`

### VitePress 提示框

::: tip 提示
这是一个提示框，全屏模式下可以预览效果！
:::

::: warning 警告
这是一个警告框
:::

::: info 信息
这是一个信息框
:::

::: danger 危险
这是一个危险框
:::

::: details 点击展开
折叠的内容在这里
:::

### 数学公式

行内公式：$E = mc^2$

块级公式：

$$
GPA = \\frac{\\sum_{i=1}^{n} (成绩_i \\times 绩点_i)}{\\sum_{i=1}^{n} 分数_i}
$$

### 任务列表

- [x] 已完成的任务
- [ ] 待完成的任务

### 表格


| 课程     | 学分 | 成绩 |
| :------- | :--: | ---: |
| 高等数学 |  5   |   92 |
| 数据结构 |  4   |   88 |

### 代码块

\`\`\`javascript
function hello() {
  console.log('Hello USC Wiki!');
}
\`\`\`
> 💡 **提示**：点击右上角 **全屏** 按钮，可以看到左右分栏视图！
> 左侧编辑 Markdown，右侧实时预览 VitePress 风格效果。

使用上方工具栏快速插入各种格式，点击 **导出** 保存为 .md 文件。
`)
      // 初始化预览
      updatePreview()
    },
  })

  // 监听全局主题变化
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        syncTheme()
      }
    })
  })
  
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  // 点击外部关闭 Emoji 选择器
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.emoji-picker') && !target.closest('[title="Emoji"]')) {
      showEmojiPicker.value = false
    }
  })
})

onUnmounted(() => {
  if (vditor) {
    vditor.destroy()
    vditor = null
  }
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})
</script>

<style scoped>
.vditor-editor-wrapper {
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
  overflow: hidden;
  margin: 20px 0;
  width: 100%;
  max-width: none;
}

.vditor-editor-wrapper.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  margin: 0;
  border-radius: 0;
  border: none;
  display: flex;
  flex-direction: column;
}

/* 编辑器主体 */
.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-body.split-view {
  display: flex;
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-pane.half-width {
  flex: 0 0 50%;
  border-right: 1px solid var(--vp-c-border);
}

.preview-pane {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.pane-header {
  padding: 8px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 24px 32px;
}

/* 自定义工具栏 */
.custom-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
  align-items: center;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 12px;
  border-right: 1px solid var(--vp-c-border);
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-right {
  margin-left: auto;
  border-right: none;
}

.group-label {
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin-right: 4px;
  white-space: nowrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.toolbar-btn code {
  font-size: 11px;
  background: none;
  padding: 0;
}

.highlight-icon {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}

.tip-btn:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  color: #10b981;
}

.warning-btn:hover {
  background: rgba(234, 179, 8, 0.1);
  border-color: #eab308;
  color: #eab308;
}

.danger-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.action-btn {
  background: var(--vp-c-bg-soft);
  font-size: 12px;
}

.export-btn {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  font-size: 12px;
  padding: 0 10px;
}

.export-btn:hover {
  background: var(--vp-c-brand-2);
  color: white;
}

/* Emoji 选择器 */
.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-border);
  max-width: 320px;
}

.emoji-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.15s ease;
}

.emoji-btn:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  transform: scale(1.1);
}

/* Vditor 容器 */
.vditor-container {
  min-height: 500px;
  width: 100%;
  flex: 1;
  overflow: auto;
}

.fullscreen .vditor-container {
  min-height: 0;
}

/* 覆盖 Vditor 默认样式 */
:deep(.vditor) {
  --toolbar-background-color: var(--vp-c-bg-soft);
  --panel-background-color: var(--vp-c-bg);
  --textarea-background-color: var(--vp-c-bg);
  border: none !important;
  width: 100% !important;
}

:deep(.vditor-toolbar) {
  display: none !important;
}

:deep(.vditor-ir) {
  background: var(--vp-c-bg) !important;
  color: var(--vp-c-text-1) !important;
}

:deep(.vditor-ir pre.vditor-reset) {
  background: var(--vp-c-bg) !important;
  color: var(--vp-c-text-1) !important;
  padding: 20px 24px !important;
}

/* 隐藏代码块的语法标记 */
:deep(.vditor-ir__marker--info) {
  display: none !important;
}

:deep(.vditor-ir .vditor-ir__marker--bi) {
  color: #8b949e !important;
}

:deep(.vditor-counter) {
  background: var(--vp-c-bg-soft) !important;
  color: var(--vp-c-text-2) !important;
  border-top: 1px solid var(--vp-c-border) !important;
  padding: 4px 16px !important;
}

/* 暗色模式适配 */
.dark :deep(.vditor) {
  --toolbar-background-color: var(--vp-c-bg-soft);
  --panel-background-color: var(--vp-c-bg);
  --textarea-background-color: var(--vp-c-bg);
}

.dark :deep(.vditor-reset) {
  color: var(--vp-c-text-1) !important;
}

.dark :deep(.vditor-reset a) {
  color: var(--vp-c-brand-1) !important;
}

.dark :deep(.vditor-reset blockquote) {
  border-left-color: var(--vp-c-brand-1) !important;
  background: var(--vp-c-bg-soft) !important;
}

.dark :deep(.vditor-reset code:not(.hljs)) {
  background: var(--vp-c-bg-soft) !important;
  color: var(--vp-c-brand-1) !important;
}

/* 响应式 */
@media (max-width: 768px) {
  .custom-toolbar {
    gap: 8px;
    padding: 8px 12px;
  }
  
  .toolbar-group {
    padding-right: 8px;
  }
  
  .group-label {
    display: none;
  }
  
  .toolbar-btn {
    min-width: 26px;
    height: 26px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .toolbar-group {
    border-right: none;
  }
  
  .toolbar-right {
    width: 100%;
    justify-content: flex-end;
  }
}

/* VitePress 风格预览样式 */
.preview-content h1 {
  font-size: 2em;
  margin: 0 0 1em;
  font-weight: 600;
  line-height: 1.25;
  color: var(--vp-c-text-1);
}

.preview-content h2 {
  font-size: 1.5em;
  margin: 1.5em 0 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--vp-c-border);
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.preview-content h3 {
  font-size: 1.25em;
  margin: 1.2em 0 0.5em;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.preview-content p {
  margin: 1em 0;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

.preview-content ul, .preview-content ol {
  padding-left: 1.5em;
  margin: 1em 0;
}

.preview-content li {
  margin: 0.5em 0;
  line-height: 1.7;
}

.preview-content code {
  background: var(--vp-c-bg-soft);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--vp-c-brand-1);
}

.preview-content pre {
  background: var(--vp-c-bg-soft);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.preview-content pre code {
  background: none;
  padding: 0;
  color: var(--vp-c-text-1);
}

/* Shiki 代码块样式 */
.preview-content pre.shiki {
  padding: 16px 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
  font-size: 14px;
  line-height: 1.6;
}

.preview-content pre.shiki code {
  background: none;
  padding: 0;
  color: inherit;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
}

.preview-content :deep(.shiki) {
  padding: 16px 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.preview-content blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.preview-content th, .preview-content td {
  border: 1px solid var(--vp-c-border);
  padding: 8px 12px;
  text-align: left;
}

.preview-content th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
}

.preview-content a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.preview-content hr {
  margin: 2em 0;
  border: none;
  border-top: 1px solid var(--vp-c-border);
}

.preview-content mark {
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  padding: 0.1em 0.3em;
  border-radius: 4px;
  color: inherit;
}

/* VitePress 自定义容器样式 */
.preview-content .custom-block {
  margin: 1em 0;
  padding: 16px 20px;
  border-radius: 8px;
  border-left: 4px solid;
}

.preview-content .custom-block-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.preview-content .custom-block.info {
  background: rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
}

.preview-content .custom-block.info .custom-block-title {
  color: #6366f1;
}

.preview-content .custom-block.tip {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.preview-content .custom-block.tip .custom-block-title {
  color: #10b981;
}

.preview-content .custom-block.warning {
  background: rgba(234, 179, 8, 0.1);
  border-color: #eab308;
}

.preview-content .custom-block.warning .custom-block-title {
  color: #eab308;
}

.preview-content .custom-block.danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.preview-content .custom-block.danger .custom-block-title {
  color: #ef4444;
}

.preview-content details.custom-block {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-border);
}

.preview-content details.custom-block summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.preview-content details.custom-block[open] summary {
  margin-bottom: 12px;
}

/* 任务列表样式 */
.preview-content .task-list-item {
  list-style: none;
  margin-left: -1.5em;
}

.preview-content .task-list-item input[type="checkbox"] {
  margin-right: 0.5em;
  transform: scale(1.2);
  accent-color: var(--vp-c-brand-1);
}

/* 数学公式样式 */
.preview-content .math-block {
  overflow-x: auto;
  padding: 16px;
  margin: 1em 0;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-align: center;
}

.preview-content .math-inline {
  padding: 0 2px;
}

.preview-content .math-error {
  color: #ef4444;
  font-family: monospace;
}

/* KaTeX 样式调整 */
.preview-content .katex-display {
  margin: 0 !important;
  overflow-x: auto;
  overflow-y: hidden;
}

.preview-content .katex {
  font-size: 1.1em;
}

/* 脚注样式 */
.preview-content .footnotes {
  margin-top: 2em;
  padding-top: 1em;
  border-top: 1px solid var(--vp-c-border);
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

.preview-content .footnotes-sep {
  display: none;
}

.preview-content .footnotes ol {
  padding-left: 1.5em;
  margin: 0;
}

.preview-content .footnotes li {
  margin: 0.5em 0;
  line-height: 1.6;
}

.preview-content .footnote-ref {
  font-size: 0.75em;
  vertical-align: super;
  line-height: 0;
  margin-left: 1px;
}

.preview-content .footnote-ref a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  padding: 0 2px;
}

.preview-content .footnote-ref a:hover {
  text-decoration: underline;
}

.preview-content .footnote-backref {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  margin-left: 4px;
  font-size: 0.85em;
}

.preview-content .footnote-backref:hover {
  text-decoration: underline;
}
</style>
