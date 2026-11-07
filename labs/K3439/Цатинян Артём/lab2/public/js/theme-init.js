(() => {
  const saved = localStorage.getItem("tablely-theme");
  const theme =
    saved === "light" || saved === "dark"
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  document.documentElement.dataset.bsTheme = theme;
})();
