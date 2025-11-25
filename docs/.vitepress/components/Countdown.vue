<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  targetDate: { type: String, required: true },
  eventName: { type: String, default: '目标日' },
  color: { type: String, default: 'var(--vp-c-brand)' }
})

const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const isExpired = ref(false)
let timer = null

const calculateTime = () => {
  const target = new Date(props.targetDate).getTime()
  const now = new Date().getTime()
  const diff = target - now

  if (diff <= 0) {
    isExpired.value = true
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    if (timer) clearInterval(timer)
    return
  }

  timeLeft.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
}

onMounted(() => {
  calculateTime()
  timer = setInterval(calculateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="countdown-card" :class="{ expired: isExpired }">
    <div class="header">
      <span class="icon">📅</span>
      <span class="event-name">{{ eventName }}</span>
      <span class="target-date">{{ targetDate }}</span>
    </div>
    
    <div v-if="!isExpired" class="timer-grid">
      <div class="time-block">
        <div class="number">{{ timeLeft.days }}</div>
        <div class="label">天</div>
      </div>
      <div class="separator">:</div>
      <div class="time-block">
        <div class="number">{{ String(timeLeft.hours).padStart(2, '0') }}</div>
        <div class="label">时</div>
      </div>
      <div class="separator">:</div>
      <div class="time-block">
        <div class="number">{{ String(timeLeft.minutes).padStart(2, '0') }}</div>
        <div class="label">分</div>
      </div>
      <div class="separator">:</div>
      <div class="time-block seconds">
        <div class="number">{{ String(timeLeft.seconds).padStart(2, '0') }}</div>
        <div class="label">秒</div>
      </div>
    </div>

    <div v-else class="expired-message">
      🎉 {{ eventName }} 已经到来！
    </div>
  </div>
</template>

<style scoped>
.countdown-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  transition: transform 0.2s;
}

.countdown-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.icon { font-size: 1.2em; }
.event-name { font-weight: bold; font-size: 1.1em; flex-grow: 1; }
.target-date { font-size: 0.9em; color: var(--vp-c-text-2); }

.timer-grid {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.number {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 2em;
  font-weight: bold;
  color: var(--vp-c-brand);
  line-height: 1;
  background: var(--vp-c-bg);
  padding: 8px;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  min-width: 60px;
  text-align: center;
}

.seconds .number {
  color: var(--vp-c-danger);
}

.label {
  font-size: 0.8em;
  color: var(--vp-c-text-2);
  margin-top: 6px;
}

.separator {
  font-size: 2em;
  font-weight: bold;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}

.expired-message {
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
  color: var(--vp-c-success);
  padding: 10px;
}
</style>
