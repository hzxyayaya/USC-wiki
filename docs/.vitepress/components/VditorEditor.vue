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
        <button class="toolbar-btn tip-btn" @click="insertContainer('info', '信息')" title="信息框（导出后渲染）">
          ℹ️
        </button>
        <button class="toolbar-btn tip-btn" @click="insertContainer('tip', '提示')" title="提示框（导出后渲染）">
          💡
        </button>
        <button class="toolbar-btn warning-btn" @click="insertContainer('warning', '警告')" title="警告框（导出后渲染）">
          ⚠️
        </button>
        <button class="toolbar-btn danger-btn" @click="insertContainer('danger', '危险')" title="危险框（导出后渲染）">
          🚫
        </button>
        <button class="toolbar-btn" @click="insertContainer('details', '点击展开')" title="折叠块（导出后渲染）">
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

    <!-- Vditor 编辑器容器 -->
    <div id="vditor" class="vditor-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

// 状态
let vditor: Vditor | null = null
const isFullscreen = ref(false)
const showEmojiPicker = ref(false)

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
      dark ? 'native' : 'github'
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
        style: dark ? 'native' : 'github',
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
    after: () => {
      vditor?.setValue(`# 欢迎使用 USC Wiki Markdown 编辑器

这是专为 USC Wiki 定制的 Markdown 编辑器。

## ✨ 支持的功能

### 基础格式
- **粗体**、*斜体*、~~删除线~~、==高亮==
- \`行内代码\`

### 数学公式

行内公式：$E = mc^2$

块级公式：
$$
GPA = \\frac{\\sum_{i=1}^{n} (学分_i \\times 绩点_i)}{\\sum_{i=1}^{n} 学分_i}
$$

### 任务列表

- [x] 已完成的任务
- [ ] 待完成的任务

### 表格

| 课程 | 学分 | 成绩 |
| :--- | :---: | ---: |
| 高等数学 | 5 | 92 |
| 数据结构 | 4 | 88 |

### 代码块

\`\`\`javascript
function hello() {
  console.log('Hello USC Wiki!');
}
\`\`\`

---

> **提示**：VitePress 特有语法（如 \`::: tip\` 提示框）在此编辑器中以原始格式显示，
> 导出后在 VitePress 中可正常渲染。

使用上方工具栏快速插入各种格式，点击 **导出** 保存为 .md 文件。
`)
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
  overflow: auto;
  display: flex;
  flex-direction: column;
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
}

.fullscreen .vditor-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
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
</style>
