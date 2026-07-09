import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(__dirname, '../../..')
const codexHome = path.join(backendRoot, '.codex')
const authSource = path.join(codexHome, 'auth.json')
const authTarget = path.resolve(backendRoot, process.env.CODEX_AUTH_FILE ?? '.env.auth')

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function runCodexLogin(): Promise<number> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32'
    const command = isWindows ? 'npx.cmd' : 'npx'
    const args = ['@openai/codex', 'login']

    const child = spawn(command, args, {
      cwd: backendRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        CODEX_HOME: codexHome,
      },
      shell: isWindows,
    })

    child.on('error', reject)
    child.on('close', (code) => resolve(code ?? 1))
  })
}

async function main(): Promise<void> {
  console.log('OpenAI Codex login')
  console.log(`CODEX_HOME: ${codexHome}`)
  console.log(`Target auth file: ${authTarget}`)
  console.log('')

  await fs.mkdir(codexHome, { recursive: true })

  const exitCode = await runCodexLogin()
  if (exitCode !== 0) {
    console.error(`\nLogin failed with exit code ${exitCode}.`)
    process.exit(exitCode)
  }

  if (!(await fileExists(authSource))) {
    console.error(`\nLogin finished but auth file not found at ${authSource}.`)
    process.exit(1)
  }

  await fs.mkdir(path.dirname(authTarget), { recursive: true })
  await fs.copyFile(authSource, authTarget)
  await fs.chmod(authTarget, 0o600)

  console.log(`\nAuth saved to ${authTarget}`)
  console.log('You can now use the IA endpoints.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
