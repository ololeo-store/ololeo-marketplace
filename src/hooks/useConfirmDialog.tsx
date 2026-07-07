"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
}

type NotifyOptions = {
  title: string
  description?: string
  variant?: "default" | "success" | "error"
  okLabel?: string
}

type PendingConfirm = { kind: "confirm"; options: ConfirmOptions; resolve: (v: boolean) => void }
type PendingNotify = { kind: "notify"; options: NotifyOptions; resolve: () => void }
type Pending = PendingConfirm | PendingNotify

type ConfirmDialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  notify: (options: NotifyOptions) => Promise<void>
}

const ConfirmDialogContext = React.createContext<ConfirmDialogContextValue | null>(null)

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  // `pending` holds the last-shown dialog data and is intentionally NOT
  // cleared on close — only `open` toggles — so the content doesn't blank
  // out mid fade-out/slide-out animation.
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState<Pending | null>(null)

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ kind: "confirm", options, resolve })
      setOpen(true)
    })
  }, [])

  const notify = React.useCallback((options: NotifyOptions) => {
    return new Promise<void>((resolve) => {
      setPending({ kind: "notify", options, resolve })
      setOpen(true)
    })
  }, [])

  const close = (result: boolean) => {
    setOpen(false)
    if (!pending) return
    if (pending.kind === "confirm") pending.resolve(result)
    else pending.resolve()
  }

  const value = React.useMemo(() => ({ confirm, notify }), [confirm, notify])

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <AlertDialog open={open} onOpenChange={(o) => !o && close(false)}>
        <AlertDialogContent>
          {pending && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{pending.options.title}</AlertDialogTitle>
                {pending.options.description && (
                  <AlertDialogDescription>{pending.options.description}</AlertDialogDescription>
                )}
              </AlertDialogHeader>
              <AlertDialogFooter>
                {pending.kind === "confirm" ? (
                  <>
                    <AlertDialogCancel onClick={() => close(false)}>
                      {pending.options.cancelLabel || "Batal"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant={pending.options.variant === "destructive" ? "destructive" : "default"}
                      onClick={() => close(true)}
                    >
                      {pending.options.confirmLabel || "Konfirmasi"}
                    </AlertDialogAction>
                  </>
                ) : (
                  <AlertDialogAction
                    variant={pending.options.variant === "error" ? "destructive" : "default"}
                    onClick={() => close(true)}
                  >
                    {pending.options.okLabel || "OK"}
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialog() {
  const ctx = React.useContext(ConfirmDialogContext)
  if (!ctx) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider")
  }
  return ctx
}
