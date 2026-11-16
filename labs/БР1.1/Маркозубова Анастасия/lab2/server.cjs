const jsonServer = require('json-server');
const setupAuthForm = require('json-server-auth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('json-server-auth/dist/constants');
const path = require('path');
const app = jsonServer.create();
const router = jsonServer.router(process.env.DB_FILE || path.join(__dirname, 'db.json'));
app.db = router.db;
app.use(
    jsonServer.defaults({
        static: __dirname,
    }),
);
app.use(jsonServer.bodyParser);
const deny = (res, code, message) =>
    res.status(code).json({
        message,
    });
app.use((req, res, next) => {
    if (
        req.path === '/register' &&
        req.method === 'POST' &&
        (!['candidate', 'employer'].includes(req.body.role) ||
            !req.body.firstname?.trim() ||
            !req.body.lastname?.trim())
    )
        return deny(res, 400, 'Укажите имя, фамилию и роль.');
    if (['/login', '/register'].includes(req.path)) return next();
    if (req.method === 'GET' && /^\/(vacancies|companies)(\/|$)/.test(req.path)) return next();
    if (!/^\/(users|vacancies|companies|resumes|applications|me)(\/|$)/.test(req.path))
        return next();
    let token;
    try {
        token = jwt.verify(
            (req.headers.authorization || '').replace(/^Bearer /, ''),
            JWT_SECRET_KEY,
        );
    } catch {
        return deny(res, 401, 'Войдите в аккаунт.');
    }
    const currentUser = router.db
        .get('users')
        .find((u) => String(u.id) === token.sub)
        .value();
    if (!currentUser) return deny(res, 401, 'Пользователь не найден.');
    req.user = currentUser;
    if (req.path === '/me') {
        const { password, ...safe } = currentUser;
        return res.json(safe);
    }
    const [, resource, id] = req.path.split('/');
    const write = !['GET', 'HEAD'].includes(req.method);
    if (resource === 'users') return deny(res, 403, 'Используйте личный кабинет.');
    if (resource === 'companies' && write)
        return deny(res, 403, 'Справочник доступен только для чтения.');
    const own = (row) => String(row.userId) === String(currentUser.id);
    const item =
        id &&
        router.db
            .get(resource)
            .find((row) => String(row.id) === id)
            .value();
    if (id && !item) return deny(res, 404, 'Запись не найдена.');
    if (resource === 'vacancies' && write) {
        if (currentUser.role !== 'employer' || (id && !own(item)))
            return deny(res, 403, 'Нет доступа к вакансии.');
        if (req.method !== 'DELETE') {
            if (
                !req.body.title?.trim() ||
                !req.body.description?.trim() ||
                !Number.isFinite(Number(req.body.salary)) ||
                Number(req.body.salary) < 0
            )
                return deny(res, 400, 'Проверьте название, описание и зарплату.');
            req.body.userId = currentUser.id;
        }
    }
    if (resource === 'resumes') {
        if (write && (currentUser.role !== 'candidate' || (id && !own(item))))
            return deny(res, 403, 'Нет доступа к резюме.');
        if (write && req.method !== 'DELETE') req.body.userId = currentUser.id;
        if (currentUser.role === 'candidate') {
            if (id && !own(item)) return deny(res, 403, 'Нет доступа к резюме.');
            if (!id && !write) req.query.userId = String(currentUser.id);
        }
    }
    if (resource === 'applications') {
        const visible = (row) =>
            own(row) ||
            (currentUser.role === 'employer' && String(row.employerId) === String(currentUser.id));
        if (id && !visible(item)) return deny(res, 403, 'Нет доступа к отклику.');
        if (req.method === 'POST') {
            if (currentUser.role !== 'candidate')
                return deny(res, 403, 'Отклик доступен соискателю.');
            const vacancy = router.db
                .get('vacancies')
                .find((v) => String(v.id) === String(req.body.vacancyId))
                .value();
            if (!vacancy) return deny(res, 404, 'Вакансия не найдена.');
            if (
                router.db
                    .get('applications')
                    .find(
                        (application) =>
                            own(application) &&
                            String(application.vacancyId) === String(vacancy.id),
                    )
                    .value()
            )
                return deny(res, 409, 'Вы уже откликнулись.');
            if (!router.db.get('resumes').find(own).value())
                return deny(res, 400, 'Сначала сохраните резюме.');
            req.body = {
                userId: currentUser.id,
                employerId: vacancy.userId || null,
                vacancyId: vacancy.id,
                candidateName: currentUser.firstname + ' ' + currentUser.lastname,
                status: 'Отправлен',
                createdAt: new Date().toISOString(),
            };
        } else if (write) return deny(res, 403, 'Изменение отклика недоступно.');
        if (!id && !write) {
            delete req.query.userId;
            delete req.query.employerId;
            req.query[currentUser.role === 'employer' ? 'employerId' : 'userId'] = String(
                currentUser.id,
            );
        }
    }
    next();
});
app.use(setupAuthForm);
app.get('/vacancies', (req, res, next) => {
    const query = [].concat(req.query.q ?? '')[0];
    const searchText = typeof query === 'string' ? query.trim().toLowerCase() : '';
    delete req.query.q;
    if (!searchText) return next();

    const requestedIds = [].concat(req.query.id ?? []);
    const matchingIds = router.db
        .get('vacancies')
        .filter((vacancy) =>
            [vacancy.title, vacancy.description].some((field) =>
                String(field ?? '').toLowerCase().includes(searchText),
            ),
        )
        .map((vacancy) => String(vacancy.id))
        .value()
        .filter((id) => !requestedIds.length || requestedIds.includes(id));

    if (!matchingIds.length) {
        res.set('X-Total-Count', '0');
        return res.json([]);
    }

    req.query.id = matchingIds;
    next();
});
app.use(router);
app.listen(Number(process.env.PORT || 3000), '127.0.0.1', () =>
    console.log('FinderJobs: http://127.0.0.1:' + (process.env.PORT || 3000)),
);
