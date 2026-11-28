"use strict";

const trainings = {
    pilates: {
        title: "Сильный центр",
        type: "Пилатес",
        level: "Начальный уровень",
        minutes: 25,
        description:
            "Спокойная практика для корпуса и осанки. " +
            "Занятие состоит из подготовки, разминки, основного блока " +
            "и спокойного завершения. Подходит для занятий дома.",
        instructions: [
            "Дыхание и настройка",
            "Разминка плеч и спины",
            "Основной блок для корпуса",
            "Спокойное завершение"
        ]
    },

    yoga: {
        title: "Утренний поток",
        type: "Йога",
        level: "Начальный уровень",
        minutes: 30,
        description:
            "Утренняя практика с плавными переходами между движениями. " +
            "В плане занятия предусмотрены настройка, разминка, " +
            "основная последовательность и спокойное завершение.",
        instructions: [
            "Дыхание и настройка",
            "Мягкая разминка",
            "Основная последовательность",
            "Спокойное завершение"
        ]
    },

    stretch: {
        title: "Мягкое тело",
        type: "Растяжка",
        level: "Средний уровень",
        minutes: 18,
        description:
            "Небольшое занятие на гибкость и подвижность. " +
            "План включает подготовку, отдельные блоки для верхней " +
            "и нижней части тела и завершение практики.",
        instructions: [
            "Подготовка к занятию",
            "Блок для плеч и верхней части тела",
            "Блок для ног и нижней части тела",
            "Завершение практики"
        ]
    }
};

const requestedTrainingId = new URLSearchParams(
    window.location.search
).get("id");

const trainingId = Object.prototype.hasOwnProperty.call(
    trainings,
    requestedTrainingId
)
    ? requestedTrainingId
    : "pilates";

const selectedTraining = trainings[trainingId];

function fillList(list, items) {
    list.replaceChildren();

    items.forEach((value) => {
        const item = document.createElement("li");
        item.textContent = value;
        list.appendChild(item);
    });
}

const trainingTitle = document.querySelector("#trainingTitle");

if (trainingTitle) {
    document.title = `${selectedTraining.title} — Вместе`;

    trainingTitle.textContent = selectedTraining.title;

    document.querySelector("#trainingType").textContent =
        selectedTraining.type;

    document.querySelector("#trainingMeta").textContent =
        `${selectedTraining.level} · ${selectedTraining.minutes} минут`;

    document.querySelector("#trainingDescription").textContent =
        selectedTraining.description;

    document.querySelector("#trainingJoin").href =
        `session.html?id=${trainingId}`;

    fillList(
        document.querySelector("#trainingInstructions"),
        selectedTraining.instructions
    );
}

const sessionTitle = document.querySelector("#sessionTitle");

if (sessionTitle) {
    document.title =
        `${selectedTraining.title} — Комната занятия — Вместе`;

    sessionTitle.textContent = selectedTraining.title;

    document.querySelector("#sessionMeta").textContent =
        `Совместная практика · ${selectedTraining.type}`;

    document.querySelector("#sessionDetails").href =
        `training.html?id=${trainingId}`;

    fillList(
        document.querySelector("#sessionSteps"),
        selectedTraining.instructions
    );
}

const typeFilter = document.querySelector("#typeFilter");
const levelFilter = document.querySelector("#levelFilter");
const durationFilter = document.querySelector("#durationFilter");
const searchFilter = document.querySelector("#searchFilter");
const trainingItems = [
    ...document.querySelectorAll(".training-item")
];

if (
    typeFilter &&
    levelFilter &&
    durationFilter &&
    searchFilter &&
    trainingItems.length
) {
    function filterTrainings() {
        const type = typeFilter.value;
        const level = levelFilter.value;

        const maxMinutes = durationFilter.value === "all"
            ? Infinity
            : Number(durationFilter.value);

        const query = searchFilter.value.trim().toLowerCase();
        let visibleCount = 0;

        trainingItems.forEach((item) => {
            const matchesType =
                type === "all" || item.dataset.type === type;

            const matchesLevel =
                level === "all" || item.dataset.level === level;

            const matchesDuration =
                Number(item.dataset.minutes) <= maxMinutes;

            const matchesQuery =
                item.textContent.toLowerCase().includes(query);

            const matches =
                matchesType &&
                matchesLevel &&
                matchesDuration &&
                matchesQuery;

            item.hidden = !matches;

            if (matches) {
                visibleCount += 1;
            }
        });

        document.querySelector("#resultsCount").textContent =
            `Найдено занятий: ${visibleCount}`;

        document.querySelector("#emptyResults").hidden =
            visibleCount !== 0;
    }

    [
        typeFilter,
        levelFilter,
        durationFilter,
        searchFilter
    ].forEach((control) => {
        control.addEventListener("input", filterTrainings);
    });

    document.querySelector("#filters").addEventListener(
        "submit",
        (event) => {
            event.preventDefault();
            filterTrainings();
        }
    );

    filterTrainings();
}

document.querySelectorAll(".needs-validation").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopPropagation();

        form.classList.add("was-validated");

        const message = form.querySelector(".form-message");

        if (!form.checkValidity()) {
            if (message) {
                message.textContent = "";
            }

            return;
        }

        if (message) {
            message.textContent =
                "Готово! Это демонстрационный режим формы.";
        }
    });
});

const planChecks = [
    ...document.querySelectorAll(".plan-check")
];

if (planChecks.length) {
    const storageKey = "fitflow-plan";
    let savedValues = [];

    try {
        const saved = localStorage.getItem(storageKey);

        if (saved) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                savedValues = parsed.filter(
                    (value) => typeof value === "string"
                );
            }
        }
    } catch {
        savedValues = [];
    }

    function updateProgress() {
        const count = planChecks.filter(
            (check) => check.checked
        ).length;

        const percentage = Math.round(
            (count / planChecks.length) * 100
        );

        document.querySelector("#completedCount").textContent =
            count;

        document.querySelector("#planProgress").style.width =
            `${percentage}%`;

        document.querySelector(".brutal-progress").setAttribute(
            "aria-valuenow",
            String(percentage)
        );
    }

    function savePlan() {
        const completed = planChecks
            .filter((check) => check.checked)
            .map((check) => check.value);

        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(completed)
            );
        } catch {
            const description = document.querySelector(
                "main .lead-copy"
            );

            if (description) {
                description.textContent =
                    "Прогресс отображается на странице, " +
                    "но браузер не разрешил его сохранение.";
            }
        }

        updateProgress();
    }

    planChecks.forEach((check) => {
        check.checked = savedValues.includes(check.value);
        check.addEventListener("change", savePlan);
    });

    updateProgress();
}

const timer = document.querySelector("#timer");

if (timer) {
    const moves = [
        ...document.querySelectorAll("#sessionSteps li")
    ];

    const moveTitle = document.querySelector("#currentMove");
    const toggleButton = document.querySelector("#timerToggle");
    const nextButton = document.querySelector("#nextMove");

    const exerciseSeconds = 40;

    let seconds = exerciseSeconds;
    let moveIndex = 0;
    let interval = null;
    let finished = false;

    function renderTimer() {
        const minutes = String(
            Math.floor(seconds / 60)
        ).padStart(2, "0");

        const remainder = String(
            seconds % 60
        ).padStart(2, "0");

        timer.textContent = `${minutes}:${remainder}`;
    }

    function stopTimer() {
        if (interval !== null) {
            clearInterval(interval);
            interval = null;
        }
    }

    function renderMove() {
        moves.forEach((move, index) => {
            const current = index === moveIndex;

            move.classList.toggle("current-step", current);

            if (current) {
                move.setAttribute("aria-current", "step");
            } else {
                move.removeAttribute("aria-current");
            }
        });

        moveTitle.textContent = moves[moveIndex].textContent;

        nextButton.textContent = moveIndex === moves.length - 1
            ? "Завершить занятие"
            : "Следующее упражнение";
    }

    function finishSession() {
        stopTimer();

        finished = true;
        seconds = 0;

        renderTimer();

        moves.forEach((move) => {
            move.classList.remove("current-step");
            move.removeAttribute("aria-current");
        });

        moveTitle.textContent = "Занятие завершено!";
        toggleButton.textContent = "Начать заново";
        nextButton.disabled = true;
    }

    function nextMove() {
        stopTimer();

        if (moveIndex === moves.length - 1) {
            finishSession();
            return;
        }

        moveIndex += 1;
        seconds = exerciseSeconds;

        toggleButton.textContent = "Начать";

        renderMove();
        renderTimer();
    }

    function resetSession() {
        stopTimer();

        finished = false;
        moveIndex = 0;
        seconds = exerciseSeconds;

        nextButton.disabled = false;
        toggleButton.textContent = "Начать";

        renderMove();
        renderTimer();
    }

    function startTimer() {
        toggleButton.textContent = "Пауза";

        interval = setInterval(() => {
            seconds = Math.max(0, seconds - 1);

            renderTimer();

            if (seconds === 0) {
                nextMove();
            }
        }, 1000);
    }

    toggleButton.addEventListener("click", () => {
        if (finished) {
            resetSession();
            startTimer();
            return;
        }

        if (interval !== null) {
            stopTimer();
            toggleButton.textContent = "Продолжить";
            return;
        }

        startTimer();
    });

    nextButton.addEventListener("click", nextMove);

    resetSession();
}

const blogButtons = [
    ...document.querySelectorAll(".blog-filter")
];

const articleItems = [
    ...document.querySelectorAll(".article-item")
];

blogButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;

        blogButtons.forEach((item) => {
            const active = item === button;

            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        articleItems.forEach((article) => {
            article.hidden =
                category !== "all" &&
                article.dataset.category !== category;
        });
    });
});