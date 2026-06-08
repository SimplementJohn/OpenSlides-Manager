import { promises as fs } from 'fs'
import path from 'path'
import { config } from '../config.js'

// Stockage local JSON simple, écritures atomiques (write tmp + rename).
// Suffisant pour un projet open source local; remplaçable par SQLite/PG plus tard.

const usersFile = path.join(config.dataDir, 'users.json')
let writeChain = Promise.resolve()

async function ensure() {
  await fs.mkdir(config.dataDir, { recursive: true })
  try { await fs.access(usersFile) }
  catch { await fs.writeFile(usersFile, '[]', 'utf8') }
}

export async function readUsers() {
  await ensure()
  const raw = await fs.readFile(usersFile, 'utf8')
  try { return JSON.parse(raw) } catch { return [] }
}

// Sérialise les écritures pour éviter les corruptions concurrentes.
export function writeUsers(users) {
  writeChain = writeChain.then(async () => {
    await ensure()
    const tmp = usersFile + '.tmp'
    await fs.writeFile(tmp, JSON.stringify(users, null, 2), 'utf8')
    await fs.rename(tmp, usersFile)
  })
  return writeChain
}

export async function findByEmail(email) {
  const users = await readUsers()
  return users.find((u) => u.email === email.toLowerCase()) || null
}

export async function findById(id) {
  const users = await readUsers()
  return users.find((u) => u.id === id) || null
}

export async function insertUser(user) {
  const users = await readUsers()
  users.push(user)
  await writeUsers(users)
  return user
}
