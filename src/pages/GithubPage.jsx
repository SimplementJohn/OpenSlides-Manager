import { Code2 } from 'lucide-react'
import GithubPanel from '../components/GithubPanel.jsx'
import { useI18n } from '../i18n.jsx'

const REPO = 'https://github.com/SimplementJohn/OpenSlides-Manager'

export default function GithubPage() {
  const { t } = useI18n()
  return (
    <>
      <div className="container page" style={{ paddingBottom: 8 }}>
        <div className="page-head reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>{t('gh.page.title')}</h1>
            <p style={{ marginTop: 8 }}>{t('gh.page.sub')}</p>
          </div>
          <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-primary">
            <Code2 size={18} /> {t('gh.view')}
          </a>
        </div>
      </div>
      <GithubPanel />
    </>
  )
}
