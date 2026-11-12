const themeKey='stolik-theme';
function setTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem(themeKey,theme);document.querySelectorAll('.theme-toggle').forEach(button=>{button.setAttribute('aria-checked',String(theme==='dark'));button.textContent=theme==='dark'?'Тёмная тема':'Светлая тема'})}
document.addEventListener('DOMContentLoaded',()=>{setTheme(localStorage.getItem(themeKey)||'light');document.querySelectorAll('.theme-toggle').forEach(button=>button.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')))});
