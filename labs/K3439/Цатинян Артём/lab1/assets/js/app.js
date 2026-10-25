const load = (key, fallback) =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
document.querySelectorAll(".filter").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    button.classList.add("active");
    document
      .querySelectorAll(".restaurant")
      .forEach(
        (card) =>
          (card.hidden =
            button.dataset.filter !== "all" &&
            card.dataset.cuisine !== button.dataset.filter),
      );
  }),
);
document
  .querySelector("#district")
  ?.addEventListener("change", (event) =>
    document
      .querySelectorAll(".restaurant")
      .forEach(
        (card) =>
          (card.hidden =
            event.target.value !== "all" &&
            card.dataset.district !== event.target.value),
      ),
  );
document.querySelectorAll("[data-toggle-password]").forEach((button) =>
  button.addEventListener("click", () => {
    const input = document.querySelector(`#${button.dataset.togglePassword}`);
    input.type = input.type === "password" ? "text" : "password";
    button.textContent = input.type === "password" ? "Показать" : "Скрыть";
  }),
);
document
  .querySelector("#register-form")
  ?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) return form.reportValidity();
    save("tablely-user", {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
    });
    location.href = "profile.html";
  });
document.querySelector("#login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) return form.reportValidity();
  save(
    "tablely-user",
    load("tablely-user", { name: "Артём", email: form.email.value.trim() }),
  );
  location.href = "profile.html";
});
document.querySelector("#booking-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) return form.reportValidity();
  save("tablely-booking", {
    date: form.date.value,
    time: form.time.value,
    guests: form.guests.value,
  });
  bootstrap.Modal.getOrCreateInstance(document.querySelector("#ok")).show();
});
const booking = load("tablely-booking", null),
  user = load("tablely-user", { name: "Артём" });
document
  .querySelector("[data-user-name]")
  ?.replaceChildren(`Привет, ${user.name}`);
document
  .querySelector("[data-booking]")
  ?.replaceChildren(
    booking
      ? `${booking.date} · ${booking.time} · ${booking.guests} · Cielo`
      : "Пока нет активных бронирований",
  );
document
  .querySelector("[data-cancel-booking]")
  ?.addEventListener("click", () => {
    localStorage.removeItem("tablely-booking");
    location.reload();
  });
