// scripts/generate-stories.mjs — FINAL, NO "DEFAULT" STORY NAME
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const { glob } = await import('glob')

const SRC_DIR = 'src'
const STORY_DIR = 'src/__stories__'

console.log('GENERATING PERFECT STORIES...\n')

const files = await glob(`${SRC_DIR}/**/*.{tsx,jsx}`, {
  ignore: [
  `${SRC_DIR}/**/*.test.*`,
  `${SRC_DIR}/**/*.stories.*`,
  `${SRC_DIR}/**/use-*`,
  `${SRC_DIR}/main.tsx`,
  `${SRC_DIR}/vite-env.d.ts`,
  `${SRC_DIR}/App.tsx`,
  `${SRC_DIR}/index.tsx`,
  `${SRC_DIR}/setupTests.*`,
  `${SRC_DIR}/**/*.d.ts`,
  `${SRC_DIR}/stories/**`,           // Kills old examples
  `${SRC_DIR}/__stories__/**`,        // Prevents self-reading
],
  nodir: true,
})

for (const file of files) {
  const parsed = path.parse(file)
  const componentName = parsed.name.replace(/^[a-z]/, c => c.toUpperCase())
  const storyDir = path.join(STORY_DIR, path.relative(SRC_DIR, parsed.dir))
  const storyPath = path.join(storyDir, `${parsed.name}.stories.tsx`)

  if (fs.existsSync(storyPath)) continue

  fs.mkdirSync(storyDir, { recursive: true })

  const relativeFromSrc = path.relative(SRC_DIR, file).replace(/\\/g, '/')
  const importPathWithoutExt = relativeFromSrc.replace(/\.(tsx|jsx)$/, '')
  const depth = path.relative(storyDir, SRC_DIR).split(path.sep).filter(Boolean).length
  const prefix = depth === 0 ? './' : '../'.repeat(depth)
  const importPath = `${prefix}${importPathWithoutExt}`

  const relDir = path.relative(SRC_DIR, parsed.dir).replace(/\\/g, '/')
  const segments = relDir ? relDir.split('/').filter(Boolean) : []
  const titleParts = []

  if (segments.length > 0) {
    if (segments[0] === 'components') {
      titleParts.push('Components')
      segments.shift()
    } else if (segments[0] === 'pages') {
      titleParts.push('Pages')
      segments.shift()
      if (segments[0] === 'dashboard') {
        titleParts.push('Dashboard')
        segments.shift()
      }
    }
  } else {
    titleParts.push('Components')
  }

  segments.forEach(seg => {
    titleParts.push(seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '))
  })
  titleParts.push(componentName)
  const title = titleParts.join('/')

  const content = `import type { Meta, StoryObj } from '@storybook/react'
import ${componentName} from '${importPath}'

const meta: Meta<typeof ${componentName}> = {
  title: '${title}',
  component: ${componentName},
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta

// Primary preview — appears when you click the component name
export const Preview: StoryObj<typeof ${componentName}> = {}
`

  fs.writeFileSync(storyPath, content.trim() + '\n')
  console.log(`Created ${title}`)
}

console.log('\nALL DONE — CLEAN, PROFESSIONAL, COMPANY-APPROVED')
