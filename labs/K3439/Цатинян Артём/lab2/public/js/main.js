import "./auth.js";
import { catalog } from "./catalog.js";
import { restaurant } from "./restaurant.js";
import { profile } from "./profile.js";
import { showError } from "./ui.js";
import { getToken } from "./api.js";
Promise.all([catalog(), restaurant(), profile()]).catch((err) => {
  if (!getToken() && document.querySelector("[data-user-name]")) {
    location.href = "login.html";
    return;
  }
  showError(document.querySelector("main") || document.body, err.message);
});
