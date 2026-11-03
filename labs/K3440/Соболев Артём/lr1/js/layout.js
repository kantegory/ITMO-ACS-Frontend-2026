// Загружает общие фрагменты страниц до настройки темы и навигации.
async function insertPartial(slot, fileName) {
  const response = await fetch(`/partials/${fileName}`);
  if (!response.ok) throw new Error(`Не удалось загрузить ${fileName}`);
  slot.insertAdjacentHTML("beforebegin", await response.text());
  const inserted = slot.previousElementSibling;
  slot.remove();
  return inserted;
}

// Добавляет к общему подвалу нужную для страницы ссылку или дату.
function addFooterExtra(footer, variant) {
  const extra = footer.querySelector("[data-footer-extra]");
  if (!extra) return;
  const linkData = {
    workouts: ["blog.html", "Блог о здоровье и питании"],
    blog: ["account.html", "Мой прогресс"],
  }[variant];
  if (linkData) {
    const link = document.createElement("a");
    link.href = linkData[0];
    link.textContent = linkData[1];
    if (variant === "blog") link.dataset.authOnly = "true";
    extra.replaceWith(link);
  } else if (variant === "article") {
    extra.textContent = "© 2026";
  } else {
    extra.remove();
  }
}

// Загружает шапку и подвал из HTML-фрагментов и отмечает текущий раздел.
export async function loadSharedLayout() {
  const headerSlots = document.querySelectorAll("[data-site-header]");
  const footerSlots = document.querySelectorAll("[data-site-footer]");
  const headers = await Promise.all([...headerSlots].map(async (slot) => {
    const variant = slot.dataset.siteHeader;
    const fileName = variant === "minimal" ? "site-header-minimal.html" : "site-header.html";
    const header = await insertPartial(slot, fileName);
    if (slot.dataset.sticky === "true") header.classList.add("sticky-top");
    return header;
  }));
  const footers = await Promise.all([...footerSlots].map(async (slot) => {
    const footer = await insertPartial(slot, "site-footer.html");
    addFooterExtra(footer, slot.dataset.siteFooter);
    return footer;
  }));
  const page = location.pathname.split("/").pop() || "index.html";
  const activePage = {
    "workout.html": "workouts.html",
    "article.html": "blog.html",
    "history.html": "account.html",
  }[page] || page;
  headers.forEach((header) => {
    header.querySelectorAll(".nav-link").forEach((link) => {
      if (link.getAttribute("href") === activePage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  });
}

