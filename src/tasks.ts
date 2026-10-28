// Task data + small pure helpers, so the handlers in TaskList stay one-liners.

export type Task = {
  id: number
  title: string
  done: boolean
}

export const initialTasks: Task[] = [
  { id: 1, title: 'Write the conference talk outline', done: false },
  { id: 2, title: 'Review the pull request from Sam', done: true },
  { id: 3, title: 'Book flights for the offsite', done: false },
  { id: 4, title: 'Update the onboarding docs', done: false },
  { id: 5, title: 'Fix the flaky login test', done: false },
]

export const toggle = (tasks: Task[], id: number) =>
  tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))

export const remove = (tasks: Task[], id: number) =>
  tasks.filter((t) => t.id !== id)

// Puts a deleted task back in its original spot (the list is ordered by id)
export const restore = (tasks: Task[], task: Task) =>
  [...tasks, task].sort((a, b) => a.id - b.id)
