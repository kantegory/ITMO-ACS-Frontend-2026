import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const directory = resolve(root, 'audits')
mkdirSync(directory, { recursive: true })
const env = { ...process.env }
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
if (!env.CHROME_PATH && process.platform === 'win32' && existsSync(edge)) env.CHROME_PATH = edge
const base = process.env.AUDIT_URL || 'http://127.0.0.1:5178/'
const summary = []
for (const [name, path] of [['catalog', 'index.html'], ['recipe', 'recipe.html?id=1'], ['login', 'login.html'], ['register', 'register.html'], ['author', 'author.html?id=2']]) {
  console.log(`Accessibility audit: ${name}`)
  const result = spawnSync(process.execPath, [resolve(root, 'node_modules/lighthouse/cli/index.js'), new URL(path, base).href, '--only-categories=accessibility', '--output=html', '--output=json', `--output-path=${resolve(directory, name)}`, '--chrome-flags=--headless=new', '--quiet'], { cwd: root, env, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`Lighthouse failed for ${name}`)
  const report = JSON.parse(readFileSync(resolve(directory, `${name}.report.json`), 'utf8'))
  const failures = Object.values(report.audits).filter((audit) => audit.score === 0).map((audit) => ({ id: audit.id, title: audit.title }))
  summary.push({ page: name, score: report.categories.accessibility.score * 100, failures })
  console.log(`${name}: ${summary.at(-1).score}/100`)
}
writeFileSync(resolve(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n')
if (summary.some((item) => item.score !== 100)) process.exitCode = 1
