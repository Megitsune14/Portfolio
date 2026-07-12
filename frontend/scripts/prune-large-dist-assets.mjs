import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(process.cwd(), 'dist')
const maxBytes = 25 * 1024 * 1024

function pruneLargeFiles(dir) {
  if (!existsSync(dir)) return

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      pruneLargeFiles(fullPath)
      continue
    }

    if (statSync(fullPath).size <= maxBytes) continue

    rmSync(fullPath)
    console.log(`Removed large asset from dist: ${fullPath.replace(distDir, 'dist')}`)
  }
}

pruneLargeFiles(distDir)
