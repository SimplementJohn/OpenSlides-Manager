import { useEffect, useState } from 'react'
import { Star, GitFork, Eye, GitBranch, Tag, CircleDot, GitCommit, Users } from 'lucide-react'
import { useI18n } from '../i18n.jsx'
import { REPO, ghFetch, fmtCount as fmt } from '../lib/github.js'

const timeAgo = (iso, lang) => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  const u = [['an', 'yr', 31536000], ['mois', 'mo', 2592000], ['j', 'd', 86400], ['h', 'h', 3600], ['min', 'min', 60]]
  for (const [fr, en, sec] of u) { const v = Math.floor(s / sec); if (v >= 1) return `${v}${lang === 'fr' ? fr : en}` }
  return lang === 'fr' ? 'à l\'instant' : 'just now'
}

export default function GithubPanel() {
  const { t, lang } = useI18n()
  const [repo, setRepo] = useState(null)
  const [contributors, setContributors] = useState([])
  const [commits, setCommits] = useState([])
  const [counts, setCounts] = useState({ branches: null, releases: null })

  useEffect(() => {
    let alive = true
    Promise.allSettled([
      ghFetch(),
      ghFetch('/contributors?per_page=12'),
      ghFetch('/commits?per_page=5'),
      ghFetch('/branches?per_page=100'),
      ghFetch('/releases?per_page=100'),
    ]).then(([rRepo, rContrib, rCommits, rBranches, rReleases]) => {
      if (!alive) return
      if (rRepo.status === 'fulfilled') setRepo(rRepo.value)
      if (rContrib.status === 'fulfilled' && Array.isArray(rContrib.value)) setContributors(rContrib.value)
      if (rCommits.status === 'fulfilled' && Array.isArray(rCommits.value)) setCommits(rCommits.value)
      setCounts({
        branches: rBranches.status === 'fulfilled' && Array.isArray(rBranches.value) ? rBranches.value.length : null,
        releases: rReleases.status === 'fulfilled' && Array.isArray(rReleases.value) ? rReleases.value.length : null,
      })
    })
    return () => { alive = false }
  }, [])

  const stats = [
    { icon: <Star size={18} />, label: t('gh.stars'), value: repo ? fmt(repo.stargazers_count) : '—' },
    { icon: <GitFork size={18} />, label: t('gh.forks'), value: repo ? fmt(repo.forks_count) : '—' },
    { icon: <Eye size={18} />, label: t('gh.watchers'), value: repo ? fmt(repo.subscribers_count) : '—' },
    { icon: <CircleDot size={18} />, label: t('gh.issues'), value: repo ? fmt(repo.open_issues_count) : '—' },
    { icon: <GitBranch size={18} />, label: t('gh.branches'), value: counts.branches ?? '—' },
    { icon: <Tag size={18} />, label: t('gh.releases'), value: counts.releases ?? '—' },
  ]

  return (
    <section className="section alt">
      <div className="container">
        <div className="section-head">
          <h2>{t('gh.title')}</h2>
          <p>{t('gh.sub')}</p>
        </div>

        <div className="gh-stats">
          {stats.map((s) => (
            <a key={s.label} href={REPO} target="_blank" rel="noreferrer" className="gh-stat">
              <span className="gh-stat-icon">{s.icon}</span>
              <span className="gh-stat-val">{s.value}</span>
              <span className="gh-stat-label">{s.label}</span>
            </a>
          ))}
        </div>

        <div className="gh-cols">
          {/* contributors */}
          <div className="card">
            <div className="gh-card-head"><Users size={18} /> {t('gh.contributors')}</div>
            {contributors.length === 0
              ? <p className="gh-empty">—</p>
              : <div className="gh-avatars">
                  {contributors.map((c) => (
                    <a key={c.id} href={c.html_url} target="_blank" rel="noreferrer"
                       title={`${c.login} · ${c.contributions} commits`}>
                      <img src={c.avatar_url} alt={c.login} loading="lazy" />
                    </a>
                  ))}
                </div>}
          </div>

          {/* activity */}
          <div className="card">
            <div className="gh-card-head"><GitCommit size={18} /> {t('gh.activity')}</div>
            {commits.length === 0
              ? <p className="gh-empty">—</p>
              : <ul className="gh-commits">
                  {commits.map((c) => (
                    <li key={c.sha}>
                      <a href={c.html_url} target="_blank" rel="noreferrer">
                        <span className="gh-commit-msg">{c.commit.message.split('\n')[0]}</span>
                        <span className="gh-commit-meta">
                          {(c.author?.login || c.commit.author?.name || '?')} · {timeAgo(c.commit.author?.date, lang)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>}
          </div>
        </div>
      </div>
    </section>
  )
}
