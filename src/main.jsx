import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import App from './App.jsx'
import { LanguageProvider } from './i18n.jsx'
import './index.css'

const Templates = lazy(() => import('./pages/Templates.jsx'))
const Editor = lazy(() => import('./pages/Editor.jsx'))
const LoadingSlides = lazy(() => import('./pages/LoadingSlides.jsx'))
const BgRemover = lazy(() => import('./pages/BgRemover.jsx'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="container page" style={{ minHeight: '60vh' }} />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/tools" element={<Templates />} />
          <Route path="/customize" element={<Editor />} />
          <Route path="/bgremover" element={<BgRemover />} />
          <Route path="/loadingslides" element={<LoadingSlides />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  </React.StrictMode>
)
