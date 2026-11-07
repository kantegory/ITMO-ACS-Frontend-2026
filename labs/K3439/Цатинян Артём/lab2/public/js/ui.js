function showError(parent, message) {
  let box = parent.querySelector("[data-error]");
  if (!box) {
    box = document.createElement("p");
    box.dataset.error = "";
    box.className = "alert alert-danger mt-3";
    box.setAttribute("role", "alert");
    parent.append(box);
  }
  box.textContent = message;
}

export { showError };
