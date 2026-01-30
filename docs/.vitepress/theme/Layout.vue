<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { page, frontmatter } = useData()
</script>

<template>
  <Layout>
    <template #doc-before>
      <div v-if="frontmatter.generatedTitle && frontmatter.layout !== 'home'" class="vp-doc-header">
        <h1 class="vp-doc-title">{{ page.title }}</h1>
        <p v-if="frontmatter.description" class="vp-doc-description">
          {{ frontmatter.description }}
        </p>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.vp-doc-header {
  margin-bottom: 32px;
}

.vp-doc-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
  font-family: var(--vp-font-family-base);
}

.vp-doc-description {
  font-size: 16px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

@media (min-width: 768px) {
  .vp-doc-title {
    font-size: 38px;
  }
}
</style>
