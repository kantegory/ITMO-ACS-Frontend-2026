export const TYPES = {
    pilates: 'Пилатес',
    yoga: 'Йога',
    stretch: 'Растяжка',
    cardio: 'Кардио',
    strength: 'Силовая'
}

export const LEVELS = {
    beginner: 'Начальный',
    middle: 'Средний'
}

export const DAYS = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
}

export const CATEGORIES = {
    yoga: 'Йога',
    food: 'Питание',
    recovery: 'Восстановление'
}

export function returnPath(value) {
    if (typeof value !== 'string' || value.includes('\\')) return '/profile'
    return /^(\/|\/profile|\/blog|\/trainings\/[^/?#]+|\/session\/[^/?#]+)(\?[^#]*)?$/.test(value)
        ? value
        : '/profile'
}