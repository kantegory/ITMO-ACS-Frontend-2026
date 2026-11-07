const STATUS_DATA = {
    pending: {
        text: 'Ожидает подтверждения',
        className: 'badge-orange',
    },
    active: {
        text: 'Активно',
        className: 'badge-green',
    },
    completed: {
        text: 'Завершено',
        className: 'badge-gray',
    },
    canceled: {
        text: 'Отменено',
        className: 'badge-red',
    },
}

function createDate(value) {
    if (!value) {
        return null
    }

    // YYYY-MM-DD
    const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T00:00:00`
        : value

    const date = new Date(normalizedValue)

    if (Number.isNaN(date.getTime())) {
        return null
    }

    return date
}

export function formatPrice(value) {
    const price = Number(value)

    if (!Number.isFinite(price)) {
        return ''
    }

    return `${price.toLocaleString('ru-RU')} ₽`
}

export function formatDate(value) {
    const date = createDate(value)

    if (!date) {
        return ''
    }

    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export function formatTime(value) {
    const date = createDate(value)

    if (!date) {
        return ''
    }

    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function getStatusData(status) {
    return STATUS_DATA[status] ?? STATUS_DATA.pending
}

export function getUserInitials(name) {
    if (!name?.trim()) {
        return ''
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
}