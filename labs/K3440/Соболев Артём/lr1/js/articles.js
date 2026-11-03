// Карточки блога, детальная статья и состояния загрузки материала.
import { escapeHtml, renderList } from "./utils.js";

export function articleCard(article) {
  const id = encodeURIComponent(article.id);
  return `<div class="col-md-6 col-lg-4"><a class="article-card d-block" href="article.html?id=${id}" aria-label="Открыть статью: ${escapeHtml(article.title)}"><img class="article-card-image" src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}" loading="lazy"><div class="article-card-content"><span class="eyebrow">${escapeHtml(article.category)} | ${Number(article.readingTime)} МИН</span><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.description)}</p></div></a></div>`;
}

// Заполнение страницы данными выбранной статьи.
export function renderArticlePage(article) {
  if (!article) return;
  document.title = `${article.title} - Fitness Platform`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = article.description;
  const header = document.querySelector("[data-article-header]");
  if (header) {
    header.querySelector(".eyebrow").textContent =
      `${article.category.toUpperCase()} | ${article.readingTime} МИНУТ ЧТЕНИЯ`;
    header.querySelector("h1").textContent = article.title;
    header.querySelector("p").textContent = article.description;
  }
  const cover = document.querySelector(".article-cover");
  if (cover) {
    cover.src = article.image;
    cover.alt = article.alt;
  }
  const body = document.querySelector("[data-article-content]");
  if (body)
    body.innerHTML = article.content
      .map((text) => `<p>${escapeHtml(text)}</p>`)
      .join("");
}

export function setupArticleDetails(articles) {
  if (!document.querySelector("[data-article-header]")) return;
  const id = new URLSearchParams(location.search).get("id") || "recovery";
  renderArticlePage(articles.find((article) => article.id === id));
}

// Заполняет превью и каталог статей, кнопку дополнительных материалов и страницу статьи.
export function renderArticleContent(articles) {
  const detailHeader = document.querySelector("[data-article-header]");
  if (!articles) {
    renderList(
      "[data-article-list], #articleGrid",
      [],
      articleCard,
      "Не удалось загрузить статьи. Проверьте, что сервер запущен.",
    );
    const message = document.querySelector(".article-loading-message");
    if (message) message.textContent = "Не удалось загрузить статью. Проверьте, что сервер запущен.";
    return;
  }
  const featured = articles.slice(0, 3);
  renderList("[data-article-list], #articleGrid", featured, articleCard, "Статьи пока не опубликованы.");
  const more = articles.slice(3);
  renderList("#moreArticles", more, articleCard, "Дополнительных статей нет.");
  const loadMoreButton = document.querySelector("#loadMoreArticles");
  if (loadMoreButton) loadMoreButton.hidden = more.length === 0;
  const articleId = new URLSearchParams(location.search).get("id") || "recovery";
  if (articles.some((article) => article.id === articleId)) {
    setupArticleDetails(articles);
    document.body.classList.remove("article-loading");
  } else if (detailHeader) {
    const message = document.querySelector(".article-loading-message");
    if (message) message.textContent = "Статья не найдена.";
  }
}
