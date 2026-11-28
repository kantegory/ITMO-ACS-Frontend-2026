export const SPRITE = '/img/sprite.svg'

export function iconHref(name) {
  const id = name.startsWith('icon-') ? name : `icon-${name}`
  return `${SPRITE}#${id}`
}

export function heartIcon(liked) {
  return liked ? 'heart' : 'heart-outline'
}

export function useIcons() {
  return { SPRITE, iconHref, heartIcon }
}
