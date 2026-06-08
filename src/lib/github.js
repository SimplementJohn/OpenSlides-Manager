// Accès centralisé à l'API GitHub publique, avec mémoïsation par URL.
// Évite les appels en double (Navbar + page GitHub) et limite le rate-limit.

export const REPO = 'https://github.com/SimplementJohn/OpenSlides-Manager'
const API = 'https://api.github.com/repos/SimplementJohn/OpenSlides-Manager'

const cache = new Map()

export function ghFetch(path = '') {
  const url = API + path
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r.status))))
  }
  return cache.get(url)
}

export const fmtCount = (n) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : `${n ?? 0}`
