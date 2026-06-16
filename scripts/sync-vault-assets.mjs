import fs from 'node:fs/promises'
import path from 'node:path'

const docsRoot = path.resolve('docs')
const outputRoot = path.resolve('public', 'vault')
const ignoredDirs = new Set(['.obsidian', '.vitepress', 'superpowers'])
const assetExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx'])

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function walk(dir) {
  if (!(await exists(dir))) return []

  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || ignoredDirs.has(entry.name)) continue
      files.push(...await walk(fullPath))
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()

    if (entry.isFile() && assetExtensions.has(extension)) {
      files.push(fullPath)
    }
  }

  return files
}

async function copyAsset(sourcePath) {
  const relativePath = path.relative(docsRoot, sourcePath)
  const targetPath = path.join(outputRoot, relativePath)

  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.copyFile(sourcePath, targetPath)
}

await fs.rm(outputRoot, { recursive: true, force: true })

const assets = await walk(docsRoot)

await Promise.all(assets.map(copyAsset))

console.log(`Synced ${assets.length} vault assets to ${path.relative(process.cwd(), outputRoot)}`)
