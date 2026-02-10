"use client"

import { toast as sonnerToast, Toaster } from "sonner"

export function toast({ message, type = "info" }) {
  switch (type) {
    case "success":
      sonnerToast.success(message)
      break
    case "error":
      sonnerToast.error(message)
      break
    case "warning":
      sonnerToast.warning(message)
      break
    default:
      sonnerToast.info(message)
  }
}

export function ToastProvider() {
  return <Toaster position="top-right" />
}
