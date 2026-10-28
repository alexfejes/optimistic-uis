// API client for the demo. Nothing in here needs to change during the talk.
//
// Requests go to the dummy backend in vite.config.ts. It responds instantly;
// turn on DevTools network throttling to simulate a slow connection. When the
// mode is 'failing' it answers with a 500. This module also keeps a tiny store (mode, in-flight requests, network
// log) so the UI can show what's happening without the component handlers
// having to do any of that bookkeeping.

import { useSyncExternalStore } from 'react'

export type ApiMode = 'healthy' | 'failing'
export type LogKind = 'info' | 'success' | 'error'
export type LogEntry = { id: number; time: string; kind: LogKind; message: string }

type ApiState = { mode: ApiMode; pendingIds: number[]; log: LogEntry[] }

let state: ApiState = { mode: 'healthy', pendingIds: [], log: [] }
let nextLogId = 0
const listeners = new Set<() => void>()

function update(patch: (s: ApiState) => Partial<ApiState>) {
  state = { ...state, ...patch(state) }
  listeners.forEach((listener) => listener())
}

function addLog(kind: LogKind, message: string) {
  const entry = { id: nextLogId++, time: new Date().toLocaleTimeString(), kind, message }
  update((s) => ({ log: [entry, ...s.log].slice(0, 8) }))
}

export function setApiMode(mode: ApiMode) {
  update(() => ({ mode }))
}

export function clearLog() {
  update(() => ({ log: [] }))
}

export function useApiStatus() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
  )
}

// Real fetch() calls to the dummy backend in vite.config.ts, so every request
// shows up in the browser's Network tab.
async function request(id: number, method: 'PATCH' | 'DELETE'): Promise<void> {
  const fail = state.mode === 'failing'
  const label = `${method} /api/tasks/${id}`
  update((s) => ({ pendingIds: [...s.pendingIds, id] }))
  addLog('info', `→ ${label}`)
  try {
    const res = await fetch(`/api/tasks/${id}${fail ? '?fail=true' : ''}`, { method })
    if (!res.ok) {
      addLog('error', `✗ ${res.status} ${res.statusText} (${label})`)
      throw new Error(`${res.status} ${res.statusText}`)
    }
    addLog('success', `✓ ${res.status} ${res.statusText} (${label})`)
  } finally {
    update((s) => ({ pendingIds: s.pendingIds.filter((p) => p !== id) }))
  }
}

export function toggleTaskApi(id: number) {
  return request(id, 'PATCH')
}

export function deleteTaskApi(id: number) {
  return request(id, 'DELETE')
}
