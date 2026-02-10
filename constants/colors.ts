export const estadoColors = {
    sin_iniciar: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        badge: 'bg-gray-500',
    },
    activa: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300',
        badge: 'bg-green-500',
    },
    pausada: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        badge: 'bg-yellow-500',
    },
    finalizada: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-300',
        badge: 'bg-blue-500',
    },
} as const

export const chartColors = {
    primary: 'hsl(221.2, 83.2%, 53.3%)',
    secondary: 'hsl(210, 40%, 96.1%)',
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    danger: 'hsl(0, 84.2%, 60.2%)',
    info: 'hsl(199, 89%, 48%)',
} as const