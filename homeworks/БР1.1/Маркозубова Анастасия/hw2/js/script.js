const API_URL = "http://localhost:3000";

function showMessage(elementId, text, type = "danger") {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.className = `alert alert-${type} mt-3`;
    element.textContent = text;
    element.classList.remove("d-none");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function registerUser(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const password = form.password.value;
    const passwordConfirm = form.passwordConfirm.value;

    if (password !== passwordConfirm) {
        showMessage("registerMessage", "Пароли не совпадают.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: form.email.value,
                password,
                firstname: form.firstName.value,
                lastname: form.lastName.value,
                role: form.role.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Не удалось зарегистрироваться.");
        }

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        window.location.href = form.role.value === "employer"
            ? "employer.html"
            : "profile.html";
    } catch (error) {
        showMessage("registerMessage", error.message || "API недоступно.");
    }
}

async function loginUser(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: form.email.value,
                password: form.password.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Неверная почта или пароль.");
        }

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        window.location.href = data.user?.role === "employer"
            ? "employer.html"
            : "profile.html";
    } catch (error) {
        showMessage("loginMessage", error.message || "API недоступно.");
    }
}

function vacancyCard(vacancy) {
    return `
        <div class="col-12 col-md-6 col-lg-4">
            <article class="card h-100 p-4 shadow-sm">
                <h3 class="h4">${escapeHtml(vacancy.title)}</h3>
                <p class="text-muted">${escapeHtml(vacancy.companyName || "Компания")}</p>
                <p>Зарплата: от ${Number(vacancy.salary).toLocaleString("ru-RU")} рублей</p>
                <p>Опыт: ${escapeHtml(vacancy.experience)}</p>
                <a href="vacancy.html?id=${encodeURIComponent(vacancy.id)}" class="btn btn-outline-primary mt-auto">
                    Подробнее
                </a>
            </article>
        </div>
    `;
}

async function loadVacancies() {
    const results = document.getElementById("vacancyResults");

    if (!results) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/vacancies`);

        if (!response.ok) {
            throw new Error("Не удалось получить вакансии.");
        }

        const vacancies = await response.json();
        const companiesResponse = await fetch(`${API_URL}/companies`);
        const companies = await companiesResponse.json();
        const companiesById = Object.fromEntries(companies.map((company) => [company.id, company.name]));

        results.innerHTML = vacancies.map((vacancy) => vacancyCard({
            ...vacancy,
            companyName: companiesById[vacancy.companyId]
        })).join("");
    } catch (error) {
        results.innerHTML = `<div class="col-12"><div class="alert alert-warning">${escapeHtml(error.message)} Запустите JSON Server.</div></div>`;
    }
}

function filterVacancies(event) {
    event.preventDefault();

    const query = document.getElementById("searchQuery").value.toLowerCase().trim();
    const industry = document.getElementById("searchIndustry").value;
    const experience = document.getElementById("searchExperience").value;

    document.querySelectorAll("#vacancyResults article").forEach((card) => {
        const text = card.textContent.toLowerCase();
        const matchesQuery = !query || text.includes(query);
        const matchesIndustry = !industry || text.includes(industry.toLowerCase());
        const matchesExperience = !experience || text.includes(experience.toLowerCase());
        card.closest(".col-12").classList.toggle("d-none", !(matchesQuery && matchesIndustry && matchesExperience));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm")?.addEventListener("submit", loginUser);
    document.getElementById("registerForm")?.addEventListener("submit", registerUser);
    document.getElementById("vacancySearchForm")?.addEventListener("submit", filterVacancies);

    if (document.getElementById("vacancyResults")) {
        loadVacancies();
    }
});
