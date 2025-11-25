<script setup>
import { ref, computed } from 'vue'

const courses = ref([
  { name: '高等数学', credit: 5.0, score: 85 },
  { name: '大学英语', credit: 3.0, score: 90 },
  { name: '计算机导论', credit: 2.0, score: 92 }
])

const addCourse = () => {
  courses.value.push({ name: '新课程', credit: 2.0, score: 80 })
}

const removeCourse = (index) => {
  courses.value.splice(index, 1)
}

const totalCredit = computed(() => {
  return courses.value.reduce((sum, c) => sum + Number(c.credit), 0)
})

const gpa = computed(() => {
  if (totalCredit.value === 0) return 0
  const totalPoint = courses.value.reduce((sum, c) => {
    // 简单算法：(分数-50)/10，实际请按学校标准修改
    let point = 0
    if (c.score >= 60) point = (c.score - 50) / 10
    return sum + point * c.credit
  }, 0)
  return (totalPoint / totalCredit.value).toFixed(2)
})
</script>

<template>
  <div class="gpa-calculator">
    <div class="card">
      <h3>🎓 GPA 计算器</h3>
      <div class="result">
        <span class="label">你的预估 GPA:</span>
        <span class="score">{{ gpa }}</span>
      </div>
      
      <div class="course-list">
        <div v-for="(course, index) in courses" :key="index" class="course-item">
          <input v-model="course.name" placeholder="课程名" class="input-name" />
          <input v-model="course.credit" type="number" placeholder="学分" class="input-num" />
          <input v-model="course.score" type="number" placeholder="分数" class="input-num" />
          <button @click="removeCourse(index)" class="btn-del">×</button>
        </div>
      </div>
      
      <button @click="addCourse" class="btn-add">+ 添加课程</button>
    </div>
  </div>
</template>

<style scoped>
.gpa-calculator {
  margin: 20px 0;
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}
.card h3 { margin-top: 0; }
.result {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--vp-c-brand);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.course-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.input-name { flex: 2; padding: 8px; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); }
.input-num { flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); }
.btn-del {
  padding: 0 12px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-add {
  width: 100%;
  padding: 10px;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-add:hover { background: var(--vp-c-brand-dark); }
</style>
