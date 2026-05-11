import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { apiMocksEnabled } from './lib/runtime'

async function enableMocking() {
  const { worker } = await import('./lib/mock/browser')

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}

const bootstrap = apiMocksEnabled ? enableMocking() : Promise.resolve()

void bootstrap.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
