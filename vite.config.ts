import react from '@vitejs/plugin-react'
import type { Connect } from 'vite'
import { defineConfig } from 'vite'

// Dummy backend that runs inside the Vite dev server, so the requests are real
// HTTP calls you can watch in the browser's Network tab.
//
//   PATCH  /api/tasks/:id   toggle a task
//   DELETE /api/tasks/:id   delete a task
//
// Responds instantly: use DevTools network throttling to make it feel slow.
// Add ?fail=true to get a 500 instead.

const mockApi: Connect.NextHandleFunction = (req, res, next) => {
  const url = new URL(req.url ?? '', 'http://localhost')
  const match = url.pathname.match(/^\/api\/tasks\/(\d+)$/)
  if (!match || !['PATCH', 'DELETE'].includes(req.method ?? '')) return next()

  const id = Number(match[1])
  const shouldFail = url.searchParams.get('fail') === 'true'

  res.setHeader('Content-Type', 'application/json')
  if (shouldFail) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Internal Server Error', id }))
  } else {
    res.statusCode = 200
    res.end(JSON.stringify({ ok: true, id, method: req.method }))
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-api',
      configureServer: (server) => void server.middlewares.use(mockApi),
      configurePreviewServer: (server) => void server.middlewares.use(mockApi),
    },
  ],
})
