const path = require('node:path');
const jsonServer = require('json-server');
const auth = require('json-server-auth');

const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

const types = [
    'pilates',
    'yoga',
    'stretch',
    'cardio',
    'strength'
];

app.db = router.db;

app.use(jsonServer.defaults({
    static: path.join(__dirname, 'public'),
    noCors: true
}));

app.use(jsonServer.bodyParser);

app.use('/api', (req, res, next) => {
    const fail = (message, code = 400) => {
        return res.status(code).json({ message });
    };

    const pathname = req.path.replace(/\/$/, '') || '/';

    if (/^\/(trainings|articles)(\/[^/]+)?$/.test(pathname)) {
        return req.method === 'GET'
            ? next()
            : fail('Эти данные доступны только для чтения.', 405);
    }

    if (pathname === '/register' || pathname === '/login') {
        if (req.method !== 'POST') {
            return fail('Нужен POST-запрос.', 405);
        }

        const { email, password, name, goal } = req.body || {};

        if (
            typeof email !== 'string' ||
            typeof password !== 'string'
        ) {
            return fail('Укажи почту и пароль.');
        }

        req.body = {
            email: email.trim().toLowerCase(),
            password
        };

        if (pathname === '/register') {
            if (
                typeof name !== 'string' ||
                !name.trim() ||
                name.trim().length > 60
            ) {
                return fail('Имя должно содержать от 1 до 60 символов.');
            }

            if (!types.includes(goal)) {
                return fail('Выбери направление.');
            }

            Object.assign(req.body, {
                name: name.trim(),
                goal,
                plan: []
            });
        }

        return next();
    }

    if (/^\/users\/\d+$/.test(pathname)) {
        if (!['GET', 'PATCH'].includes(req.method)) {
            return fail('Доступны GET и PATCH.', 405);
        }

        if (Object.keys(req.query).length) {
            return fail('Параметры здесь не нужны.');
        }

        const id = Number(pathname.split('/')[2]);

        if (!router.db.get('users').find({ id }).value()) {
            return fail('Пользователь не найден.', 404);
        }

        if (req.method === 'PATCH' && !Object.hasOwn(req.body || {}, 'planChange')) {
            const { plan } = req.body || {};

            const knownIds = router.db
                .get('trainings')
                .value()
                .map(item => item.id);

            const valid =
                Array.isArray(plan) &&
                plan.length <= 7 &&
                plan.every(item =>
                    item &&
                    days.includes(item.day) &&
                    knownIds.includes(item.trainingId) &&
                    typeof item.completed === 'boolean'
                ) &&
                new Set(plan.map(item => item.day)).size === plan.length;

            if (!valid) {
                return fail('Некорректный план занятий.');
            }

            req.body = {
                plan: plan.map(({ day, trainingId, completed }) => ({
                    day,
                    trainingId,
                    completed
                }))
            };
        }

        return next();
    }

    return fail('Такого адреса API нет.', 404);
});

app.use('/api', auth.rewriter({ users: 600 }));
app.use('/api', auth);

router.render = (req, res) => {
    const data = res.locals.data;

    if (
        data &&
        !Array.isArray(data) &&
        Object.hasOwn(data, 'password')
    ) {
        const { password, ...safeUser } = data;
        return res.json(safeUser);
    }

    return res.json(data);
};

app.patch('/api/users/:id', (req, res, next) => {
    if (!Object.hasOwn(req.body || {}, 'planChange')) return next();

    const { action, day, trainingId, completed } = req.body.planChange || {};
    const knownTraining = router.db.get('trainings').find({ id: trainingId }).value();

    if (
        !['add', 'complete', 'remove'].includes(action) ||
        !days.includes(day) ||
        typeof trainingId !== 'string' ||
        !knownTraining ||
        (action === 'complete' && typeof completed !== 'boolean')
    ) {
        return res.status(400).json({ message: 'Некорректное изменение плана.' });
    }

    const userRecord = router.db.get('users').find({ id: Number(req.params.id) });
    const user = userRecord.value();
    const plan = user.plan || [];
    const previous = plan.find(item => item.day === day);

    if (action !== 'add' && previous?.trainingId !== trainingId) {
        return res.status(409).json({
            message: 'Занятие в этот день изменилось. Обнови страницу и попробуй снова.'
        });
    }

    let nextPlan;

    if (action === 'add') {
        const item = previous?.trainingId === trainingId
            ? previous
            : { day, trainingId, completed: false };
        nextPlan = [...plan.filter(item => item.day !== day), item];
    } else if (action === 'complete') {
        nextPlan = plan.map(item => item.day === day ? { ...item, completed } : item);
    } else {
        nextPlan = plan.filter(item => item.day !== day);
    }

    res.locals.data = userRecord.assign({ plan: nextPlan }).write();
    return router.render(req, res);
});

app.use('/api', router);

app.use((req, res) => {
    res.status(404).json({
        message: 'Страница не найдена.'
    });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error(error.message);

    res.status(error.status || 500).json({
        message: error.status === 400
            ? 'Некорректный JSON.'
            : 'Ошибка сервера.'
    });
});

const port = Number(process.env.PORT) || 3001;

app.listen(port, '127.0.0.1', () => {
    console.log(`API Вместе: http://127.0.0.1:${port}/api`);
});