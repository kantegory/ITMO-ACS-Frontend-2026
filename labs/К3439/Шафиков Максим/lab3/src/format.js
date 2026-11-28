const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

export const photoUrl = image => '/assets/images/' + encodeURIComponent(image) + '.webp';
export const today = () => new Intl.DateTimeFormat('sv-SE').format(new Date());
export const displayDate = date => dateFormatter.format(new Date(date + 'T12:00:00'));
