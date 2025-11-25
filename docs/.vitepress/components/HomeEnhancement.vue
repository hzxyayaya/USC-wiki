<script setup>
import { ref } from 'vue'

const quickLinks = [
  { icon: '📅', title: '校历查询', desc: '当前学期周次', link: '/tools/#校历' },
  { icon: '🚌', title: '校车时刻', desc: '实时班次信息', link: '/life/campus#校车时刻表' },
  { icon: '🧮', title: 'GPA 计算器', desc: '预估你的绩点', link: '/tools/' },
  { icon: '📱', title: '软件推荐', desc: '提升学习效率', link: '/resources/software' },
  { icon: '🏫', title: '学院课程', desc: '查看课程信息', link: '/academics/colleges/cs/' },
  { icon: '📜', title: '证书报名', desc: '四六级/计算机', link: '/resources/certificates' }
]

const announcements = [
  { date: '11-24', content: '🎉 USC Wiki 正式上线啦！', tag: '公告' },
  { date: '11-20', content: '📝 期末考试时间已公布', tag: '教务' },
  { date: '11-15', content: '🚌 校车时刻表冬季调整', tag: '生活' }
]
</script>

<template>
  <div class="home-enhancement">
    <!-- 快捷入口 -->
    <div class="quick-access">
      <h2 class="section-title">⚡ 快捷入口</h2>
      <div class="quick-grid">
        <a 
          v-for="link in quickLinks" 
          :key="link.title"
          :href="link.link"
          class="quick-card"
        >
          <div class="quick-icon">{{ link.icon }}</div>
          <div class="quick-content">
            <div class="quick-title">{{ link.title }}</div>
            <div class="quick-desc">{{ link.desc }}</div>
          </div>
        </a>
      </div>
    </div>

    <!-- 最新动态 -->
    <div class="announcements">
      <h2 class="section-title">📢 最新动态</h2>
      <div class="announcement-list">
        <div 
          v-for="item in announcements" 
          :key="item.content"
          class="announcement-item"
        >
          <span class="announcement-date">{{ item.date }}</span>
          <span class="announcement-tag">{{ item.tag }}</span>
          <span class="announcement-content">{{ item.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-enhancement {
  max-width: 1152px;
  margin: 0 auto;
  padding: 48px 24px;
}

.section-title {
  font-size: 1.8em;
  margin-bottom: 24px;
  font-weight: 600;
}

/* 快捷入口 */
.quick-access {
  margin-bottom: 64px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
}

.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  border-color: var(--vp-c-brand);
}

.quick-icon {
  font-size: 2.5em;
  flex-shrink: 0;
}

.quick-content {
  flex: 1;
}

.quick-title {
  font-weight: 600;
  font-size: 1.1em;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.quick-desc {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

/* 最新动态 */
.announcements {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 32px;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border-left: 3px solid var(--vp-c-brand);
}

.announcement-date {
  font-family: monospace;
  font-size: 0.9em;
  color: var(--vp-c-text-3);
  min-width: 50px;
}

.announcement-tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
}

.announcement-content {
  flex: 1;
  color: var(--vp-c-text-1);
}

/* 响应式 */
@media (max-width: 768px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }
  
  .announcement-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
