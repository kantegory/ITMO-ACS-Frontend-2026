// Общие помощники: безопасный HTML-текст, сообщения ошибок и раскрытие блоков.

// Экранирование значений перед вставкой в HTML-шаблоны.
export function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}

export function showFormError(form, message) {
  let output = form.querySelector("[data-form-error]");
  if (!output) {
    output = document.createElement("p");
    output.dataset.formError = "";
    output.className = "form-error";
    output.setAttribute("role", "alert");
    output.tabIndex = -1;
    form.querySelector("h1")?.after(output);
  }
  output.textContent = message;
  output.focus();
}

// Заполняет один или несколько списков карточками или общим пустым состоянием.
export function renderList(selector, items, renderItem, emptyMessage) {
  const markup = items.length
    ? items.map(renderItem).join("")
    : `<div class="col-12"><p class="empty-state" role="status">${escapeHtml(emptyMessage)}</p></div>`;
  document.querySelectorAll(selector).forEach((container) => {
    container.innerHTML = markup;
  });
}
export function setupExpandableSection(
  buttonSelector,
  contentSelector,
  collapsedText,
  expandedText,
) {
  const button = document.querySelector(buttonSelector);
  const content = document.querySelector(contentSelector);
  if (!button || !content) return;
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    content.classList.toggle("d-none", expanded);
    button.setAttribute("aria-expanded", String(!expanded));
    button.textContent = expanded ? collapsedText : expandedText;
  });
}

