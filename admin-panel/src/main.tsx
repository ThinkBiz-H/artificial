import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installImageFallback } from './lib/imageFallback'

installImageFallback()

// Pages are lazy-loaded chunks. After a deploy, a tab still running the old
// build asks for chunk files that no longer exist — reload once to pick up
// the new build instead of showing a broken page.
window.addEventListener('vite:preloadError', (event) => {
  const key = 'admin-chunk-reload'
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  event.preventDefault()
  window.location.reload()
})
window.addEventListener('load', () => setTimeout(() => sessionStorage.removeItem('admin-chunk-reload'), 10000))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
