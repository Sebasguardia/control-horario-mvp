'use client'

import { toast as sonnerToast } from 'sonner'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
    title?: string
    description?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

export function useToast() {
    const toast = (message: string, options?: ToastOptions) => {
        return sonnerToast(message, {
            description: options?.description,
            duration: options?.duration || 3000,
            action: options?.action,
        })
    }

    const success = (message: string, options?: ToastOptions) => {
        return sonnerToast.success(message, {
            description: options?.description,
            duration: options?.duration || 3000,
            action: options?.action,
        })
    }

    const error = (message: string, options?: ToastOptions) => {
        return sonnerToast.error(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            action: options?.action,
        })
    }

    const warning = (message: string, options?: ToastOptions) => {
        return sonnerToast.warning(message, {
            description: options?.description,
            duration: options?.duration || 3500,
            action: options?.action,
        })
    }

    const info = (message: string, options?: ToastOptions) => {
        return sonnerToast.info(message, {
            description: options?.description,
            duration: options?.duration || 3000,
            action: options?.action,
        })
    }

    const loading = (message: string) => {
        return sonnerToast.loading(message)
    }

    const promise = <T,>(
        promise: Promise<T>,
        {
            loading: loadingMessage,
            success: successMessage,
            error: errorMessage,
        }: {
            loading: string
            success: string | ((data: T) => string)
            error: string | ((error: any) => string)
        }
    ) => {
        return sonnerToast.promise(promise, {
            loading: loadingMessage,
            success: successMessage,
            error: errorMessage,
        })
    }

    const dismiss = (toastId?: string | number) => {
        if (toastId) {
            sonnerToast.dismiss(toastId)
        } else {
            sonnerToast.dismiss()
        }
    }

    return {
        toast,
        success,
        error,
        warning,
        info,
        loading,
        promise,
        dismiss,
    }
}

// Export directo para usar sin el hook
export const toast = {
    success: (message: string, options?: ToastOptions) =>
        sonnerToast.success(message, options),
    error: (message: string, options?: ToastOptions) =>
        sonnerToast.error(message, options),
    warning: (message: string, options?: ToastOptions) =>
        sonnerToast.warning(message, options),
    info: (message: string, options?: ToastOptions) =>
        sonnerToast.info(message, options),
    loading: (message: string) =>
        sonnerToast.loading(message),
    dismiss: (toastId?: string | number) =>
        sonnerToast.dismiss(toastId),
}