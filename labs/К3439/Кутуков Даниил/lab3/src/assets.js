const photos = import.meta.glob('@lab1/assets/*.jpg', { query: '?url', import: 'default', eager: true });
const urls = Object.fromEntries(Object.entries(photos).map(([path, url]) => [path.split('/').at(-1), url]));
export const photo = name => urls[name];
