<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  url: string
}>()

// 根据文件后缀名简单判断图标类型（可选优化）
const fileType = computed(() => {
  if (props.url.endsWith('.pdf')) return 'pdf'
  if (props.url.endsWith('.doc') || props.url.endsWith('.docx')) return 'word'
  if (props.url.endsWith('.zip') || props.url.endsWith('.rar')) return 'zip'
  return 'file'
})

const iconColor = computed(() => {
  switch (fileType.value) {
    case 'pdf': return 'text-red-500'
    case 'word': return 'text-blue-500'
    case 'zip': return 'text-yellow-500'
    default: return 'text-gray-500'
  }
})
</script>

<template>
  <a :href="url" target="_blank" class="block !no-underline group">
    <div class="relative flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-[#18181b] transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-blue-900/10 group-hover:-translate-y-0.5">
      
      <!-- Icon -->
      <div class="flex-shrink-0">
        <div :class="['w-10 h-10 flex items-center justify-center rounded-lg transition-colors', 
          fileType === 'pdf' ? 'bg-red-500/10 text-red-500' : 
          fileType === 'word' ? 'bg-blue-500/10 text-blue-500' : 
          fileType === 'zip' ? 'bg-yellow-500/10 text-yellow-500' : 
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-500']">
          
          <svg v-if="fileType === 'pdf'" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v2.5zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
          <svg v-else-if="fileType === 'word'" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0 flex flex-col justify-center">
        <h3 class="text-[15px] font-medium text-zinc-900 dark:text-zinc-100 truncate !m-0 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ title }}
        </h3>
      </div>
    </div>
  </a>
</template>

<style scoped>
a {
  text-decoration: none !important;
  color: inherit !important;
}
.group {
  display: block;
}
.relative {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  border: 1px solid #e4e4e7;
}
.dark .relative {
  border-color: rgba(63, 63, 70, 0.8);
  background-color: #18181b;
}
</style>
