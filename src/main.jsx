import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import App from './App.jsx'
import { LanguageProvider } from './i18n.jsx'
import { AuthProvider } from './auth.jsx'
import './index.css'

const Templates = lazy(() => import('./pages/Templates.jsx'))
const Editor = lazy(() => import('./pages/Editor.jsx'))
const LoadingSlides = lazy(() => import('./pages/LoadingSlides.jsx'))
const BgRemover = lazy(() => import('./pages/BgRemover.jsx'))
const Arrange = lazy(() => import('./pages/Arrange.jsx'))
const GithubPage = lazy(() => import('./pages/GithubPage.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Account = lazy(() => import('./pages/Account.jsx'))
const Pagination = lazy(() => import('./pages/Pagination.jsx'))
const Watermark  = lazy(() => import('./pages/Watermark.jsx'))
const Reformat   = lazy(() => import('./pages/Reformat.jsx'))
const PptxToPdf  = lazy(() => import('./pages/PptxToPdf.jsx'))
const PdfToPptx  = lazy(() => import('./pages/PdfToPptx.jsx'))
const Present    = lazy(() => import('./pages/Present.jsx'))
const NotFound   = lazy(() => import('./pages/NotFound.jsx'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Suspense fallback={<div className="container page" style={{ minHeight: '60vh' }} />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
    <AuthProvider>
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/tools" element={<Templates />} />
          <Route path="/customize" element={<Editor />} />
          <Route path="/bgremover" element={<BgRemover />} />
          <Route path="/loadingslides" element={<LoadingSlides />} />
          <Route path="/arrange" element={<Arrange />} />
          <Route path="/pagination" element={<Pagination />} />
          <Route path="/watermark"  element={<Watermark />} />
          <Route path="/reformat"   element={<Reformat />} />
          <Route path="/pptx2pdf"   element={<PptxToPdf />} />
          <Route path="/pdf2pptx"   element={<PdfToPptx />} />
          <Route path="/present"    element={<Present />} />
          <Route path="/github" element={<GithubPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
)
