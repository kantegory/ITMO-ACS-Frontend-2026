/**
 * ДЗ4 — хелпер для SVG-спрайта
 * Использование: ViceIcons.html("icon-heart") или ViceIcons.set(el, "icon-moon")
 */
(function (global) {
  "use strict";

  const SPRITE = "img/sprite.svg";

  function html(id, className) {
    const cls = className || "icon";
    return (
      '<svg class="' +
      cls +
      '" aria-hidden="true" focusable="false">' +
      '<use href="' +
      SPRITE +
      "#" +
      id +
      '"></use></svg>'
    );
  }

  function set(svgOrUse, id) {
    if (!svgOrUse) return;
    const use =
      svgOrUse.tagName && svgOrUse.tagName.toLowerCase() === "use"
        ? svgOrUse
        : svgOrUse.querySelector("use");
    if (use) use.setAttribute("href", SPRITE + "#" + id);
  }

  function heartId(liked) {
    return liked ? "icon-heart" : "icon-heart-outline";
  }

  global.ViceIcons = { SPRITE, html, set, heartId };
})(window);
