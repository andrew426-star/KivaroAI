import * as React from "react"

type ToasterToast = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type Toast = Omit<ToasterToast, "id">

const listeners: Array<(toasts: ToasterToast[]) => void> = []
let toasts: ToasterToast[] = []
let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

function dispatch(newToasts: ToasterToast[]) {
  toasts = newToasts
  listeners.forEach((l) => l(toasts))
}

function toast(props: Toast) {
  const id = genId()
  const newToast = { ...props, id }
  dispatch([...toasts, newToast])

  setTimeout(() => {
    dispatch(toasts.filter((t) => t.id !== id))
  }, 4000)

  return { id, dismiss: () => dispatch(toasts.filter((t) => t.id !== id)) }
}

function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(toasts)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  return { toasts: state, toast }
}

export { useToast, toast }
