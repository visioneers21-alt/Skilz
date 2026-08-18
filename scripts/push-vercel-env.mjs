#!/usr/bin/env node
/**
 * Push local .env values to Vercel (production, preview, development).
 * Usage: node scripts/push-vercel-env.mjs
 * Requires: vercel CLI logged in, project linked in cwd.
 */

import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env')

function parseEnv(content) {
  const out = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

if (!existsSync(envPath)) {
  console.error('Missing .env — copy .env.example and fill in values first.')
  process.exit(1)
}

const env = parseEnv(readFileSync(envPath, 'utf8'))

// Required for competition / deploy checklist; app uses Google Gemini.
if (!env.NEXT_PUBLIC_AI_PROVIDER) {
  env.NEXT_PUBLIC_AI_PROVIDER = 'google'
}

const KEYS = [
  'NEXT_PUBLIC_AI_PROVIDER',
  'DATABASE_URL',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'GEMINI_MODEL',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]

const TARGETS = ['production', 'preview', 'development']

function addEnv(key, value, target) {
  const isPublic = key.startsWith('NEXT_PUBLIC_')
  const sensitive =
    target === 'development'
      ? '--no-sensitive'
      : isPublic
        ? '--no-sensitive'
        : '--sensitive'
  const args = [
    'env',
    'add',
    key,
    target,
    '--value',
    value,
    '--yes',
    sensitive,
    '--force',
  ]
  execSync(`npx vercel ${args.map((a) => JSON.stringify(a)).join(' ')}`, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
}

console.log('Pushing environment variables to Vercel project (skilz)…\n')
console.log('Tip: run `npx vercel link` first if this is a fresh clone.\n')

for (const key of KEYS) {
  const value = env[key]?.trim()
  if (!value) {
    console.log(`⏭  Skip ${key} (not set in .env)`)
    continue
  }
  for (const target of TARGETS) {
    process.stdout.write(`→ ${key} [${target}]… `)
    try {
      addEnv(key, value, target)
      console.log('ok')
    } catch {
      console.log('failed')
      process.exitCode = 1
    }
  }
}

console.log('\nDone. Redeploy for changes to take effect: vercel --prod')
