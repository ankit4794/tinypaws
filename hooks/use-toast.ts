// Inspired by react-hot-toast library
import { useState, useEffect, useCallback } from "react"

import type { ToastProps } from "@/components/ui/toast"
import { toast } from "@/components/ui/toast"

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.open === false) {
        setTimeout(() => {
          setToasts((toasts) => toasts.filter((t) => t.id !== toast.id))
        }, 1000)
      }
    })
  }, [toasts])

  const addToast = useCallback((props: Omit<ToastProps, "id" | "open">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, open: true, ...props }
    setToasts((toasts) => [...toasts, newToast])
    return id
  }, [])

  const updateToast = useCallback((id: string, props: Partial<ToastProps>) => {
    setToasts((toasts) => toasts.map((t) => (t.id === id ? { ...t, ...props } : t)))
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
    )
  }, [])

  return {
    toast: addToast,
    update: updateToast,
    dismiss: dismissToast,
    toasts,
  }
}