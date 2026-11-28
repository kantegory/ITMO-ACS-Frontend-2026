import strength from './assets/strength.webp'
import cardio from './assets/cardio.webp'
import stretch from './assets/stretch.webp'
import dumbbell from './assets/dumbbell.webp'

export const categories = ['Силовые', 'Кардио', 'Растяжка'] as const

export interface Workout {
  id: string
  title: string
  category: (typeof categories)[number]
  minutes: number
  level: string
  description: string
  image: string
}

export const workouts: Workout[] = [
  {
    id: 'easy-strength',
    title: 'Силовая для начинающих',
    category: 'Силовые',
    minutes: 15,
    level: 'Начальный',
    description: 'Короткая тренировка на всё тело с лёгкими гантелями.',
    image: strength,
  },
  {
    id: 'low-impact',
    title: 'Кардио без прыжков',
    category: 'Кардио',
    minutes: 20,
    level: 'Начальный',
    description: 'Шаги и простые движения на месте для занятия дома.',
    image: cardio,
  },
  {
    id: 'full-stretch',
    title: 'Растяжка всего тела',
    category: 'Растяжка',
    minutes: 15,
    level: 'Начальный',
    description: 'Спокойное занятие после тренировки или в день отдыха.',
    image: stretch,
  },
  {
    id: 'dumbbell',
    title: 'Силовая с гантелями',
    category: 'Силовые',
    minutes: 30,
    level: 'Средний',
    description: 'Упражнения на всё тело с гантелями и ковриком.',
    image: dumbbell,
  },
]
