import { useState } from 'react'
import {
  clearLog,
  deleteTaskApi,
  setApiMode,
  toggleTaskApi,
  useApiStatus,
} from './api'
import * as list from './tasks'
import { initialTasks, type Task } from './tasks'

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const { mode, pendingIds, log } = useApiStatus()

  // ❌ PESSIMISTIC: wait for the server, THEN update the screen.
  //    On a slow network the user clicks and stares at nothing.

  // async function handleToggle(task: Task) {
  //   try {
  //     await toggleTaskApi(task.id) // ⏳ waiting...
  //     setTasks((prev) => list.toggle(prev, task.id)) // 🐢 ...finally update
  //   } catch {
  //     // request failed: nothing changed on screen, so nothing to undo
  //   }
  // }

  // async function handleDelete(task: Task) {
  //   try {
  //     await deleteTaskApi(task.id) // ⏳ waiting...
  //     setTasks((prev) => list.remove(prev, task.id)) // 🐢 ...finally update
  //   } catch {
  //     // request failed: nothing changed on screen, so nothing to undo
  //   }
  // }

  // ✅ OPTIMISTIC: update the screen FIRST, call the server in the background,
  //    and roll back in the catch if the request fails.
  //
  //    The live edit is tiny: move the setTasks line above the try, and add
  //    the opposite change in the catch.
  
  async function handleToggle(task: Task) {
    setTasks((prev) => list.toggle(prev, task.id))   // 1. update screen now
    try {
      await toggleTaskApi(task.id)                   // 2. server in background
    } catch {
      setTasks((prev) => list.toggle(prev, task.id)) // 3. rollback: toggle back
    }
  }
  
  async function handleDelete(task: Task) {
    setTasks((prev) => list.remove(prev, task.id))   // 1. update screen now
    try {
      await deleteTaskApi(task.id)                   // 2. server in background
    } catch {
      setTasks((prev) => list.restore(prev, task))   // 3. rollback: put it back
    }
  }

  // ---------------------------------------------------------------------------
  // Everything below is just the UI, nothing to change for the demo.
  // ---------------------------------------------------------------------------

  return (
    <div className="task-app">
      <header>
        <h1>My Tasks</h1>
        <p className="subtitle">
          Turn on network throttling in DevTools to feel the difference.
        </p>
      </header>

      <div className="api-mode" role="group" aria-label="Mock API behaviour">
        <button
          type="button"
          className={mode === 'healthy' ? 'mode healthy active' : 'mode healthy'}
          aria-pressed={mode === 'healthy'}
          onClick={() => setApiMode('healthy')}
        >
          ✅ Working API
        </button>
        <button
          type="button"
          className={mode === 'failing' ? 'mode failing active' : 'mode failing'}
          aria-pressed={mode === 'failing'}
          onClick={() => setApiMode('failing')}
        >
          💥 Failing API
        </button>
      </div>

      <div className={pendingIds.length > 0 ? 'status busy' : 'status'}>
        {pendingIds.length > 0
          ? `⏳ ${pendingIds.length} request${pendingIds.length > 1 ? 's' : ''} in flight…`
          : 'Idle: no requests in flight'}
      </div>

      <ul className="tasks">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? 'done' : undefined}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleToggle(task)}
              />
              <span className="title">{task.title}</span>
            </label>
            <button
              type="button"
              className="delete"
              onClick={() => handleDelete(task)}
              aria-label={`Delete ${task.title}`}
            >
              Delete
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="empty">All clear 🎉</li>}
      </ul>

      <button
        type="button"
        className="reset"
        onClick={() => {
          setTasks(initialTasks)
          clearLog()
        }}
      >
        Reset demo
      </button>

      <section className="log" aria-live="polite">
        <h2>Network log</h2>
        {log.length === 0 && <p className="log-empty">Click something…</p>}
        <ol>
          {log.map((entry) => (
            <li key={entry.id} className={entry.kind}>
              <time>{entry.time}</time> {entry.message}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
