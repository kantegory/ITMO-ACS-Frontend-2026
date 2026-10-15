"use strict";

// Общая навигация повторяется на всех восьми страницах.
document.querySelector("#site-header").innerHTML = `
  <nav class="navbar navbar-expand-md site-nav">
    <div class="container">
      <a class="brand" href="index.html">Тихий двор</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
        data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false"
        aria-label="Открыть меню"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse justify-content-end" id="navigation">
        <div class="navbar-nav gap-3">
          <a class="nav-link" href="index.html">Рестораны</a>
          <a class="nav-link" href="tables.html">Бронирование</a>
          <a class="nav-link" href="profile.html">Профиль</a>
          <a class="btn btn-outline-primary" href="bookings.html">Мои брони</a>
        </div>
      </div>
    </div>
  </nav>`;
document.querySelector("#site-footer").innerHTML = `
  <div class="container d-flex justify-content-between gap-3 flex-wrap py-4 small">
    <span>Тихий двор - место для неспешных встреч</span>
    <span>Каждый день · 12:00-23:00</span>
  </div>`;

