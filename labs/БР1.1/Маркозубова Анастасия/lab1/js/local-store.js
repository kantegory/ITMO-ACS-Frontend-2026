const DATABASE_KEY = 'finderjobs-lab1-database';
const SESSION_KEY = 'finderjobs-lab1-session';

function loadDatabase() {
    const saved = localStorage.getItem(DATABASE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(DEMO_DATA);
}

function saveDatabase(database) {
    localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
}

function getLocalUser(database) {
    const userId = localStorage.getItem(SESSION_KEY);
    return database.users.find(user => String(user.id) === userId);
}

async function localRequest(path, method = 'GET', body) {
    const database = loadDatabase();
    const url = new URL(path, 'http://local');
    const [resource, id] = url.pathname.slice(1).split('/');
    let currentUser = getLocalUser(database);

    if (resource === 'register' || resource === 'login') {
        if (resource === 'register') {
            if (database.users.some(user => user.email === body.email)) {
                throw new Error('Эта почта уже зарегистрирована.');
            }
            if (body.password.length < 4) throw new Error('Пароль должен содержать минимум 4 символа.');
            currentUser = { ...body, id: crypto.randomUUID() };
            database.users.push(currentUser);
            saveDatabase(database);
        } else {
            currentUser = database.users.find(user =>
                user.email === body.email && user.password === body.password
            );
            if (!currentUser) throw new Error('Неверная почта или пароль.');
        }
        const { password, ...user } = currentUser;
        return { accessToken: String(user.id), user };
    }

    if (resource === 'me') {
        if (!currentUser) throw new Error('Войдите в аккаунт.');
        const { password, ...user } = currentUser;
        return user;
    }

    const collection = database[resource];
    if (!Array.isArray(collection)) throw new Error('Раздел не найден.');
    if (!currentUser && !['vacancies', 'companies'].includes(resource)) {
        throw new Error('Войдите в аккаунт.');
    }

    const owns = item => String(item.userId) === String(currentUser?.id);
    const item = collection.find(item => String(item.id) === id);
    if (id && !item) throw new Error('Запись не найдена.');

    if (method === 'GET') {
        let result = id ? [item] : [...collection];
        if (resource === 'resumes' && currentUser.role === 'candidate') result = result.filter(owns);
        if (resource === 'applications') {
            result = result.filter(item => currentUser.role === 'employer'
                ? String(item.employerId) === String(currentUser.id)
                : owns(item));
        }
        for (const [key, value] of url.searchParams) {
            result = result.filter(item => key === 'salary_gte'
                ? Number(item.salary) >= Number(value)
                : String(item[key]) === value);
        }
        return structuredClone(id ? result[0] : result);
    }

    if (!currentUser) throw new Error('Войдите в аккаунт.');
    if (resource === 'vacancies' &&
        (currentUser.role !== 'employer' || (item && !owns(item)))) {
        throw new Error('Можно изменять только свои вакансии.');
    }
    if (resource === 'resumes' &&
        (currentUser.role !== 'candidate' || (item && !owns(item)))) {
        throw new Error('Можно изменять только своё резюме.');
    }

    if (resource === 'applications') {
        if (method !== 'POST' || currentUser.role !== 'candidate') {
            throw new Error('Отклик доступен соискателю.');
        }
        const vacancy = database.vacancies.find(vacancy => String(vacancy.id) === String(body.vacancyId));
        if (!vacancy) throw new Error('Вакансия не найдена.');
        if (!database.resumes.some(owns)) throw new Error('Сначала сохраните резюме.');
        if (collection.some(application => owns(application) &&
            String(application.vacancyId) === String(vacancy.id))) {
            throw new Error('Вы уже откликнулись.');
        }
        body = {
            vacancyId: vacancy.id,
            employerId: vacancy.userId,
            candidateName: currentUser.firstname + ' ' + currentUser.lastname,
            status: 'Отправлен',
            createdAt: new Date().toISOString()
        };
    }

    if (method === 'DELETE') {
        collection.splice(collection.indexOf(item), 1);
        saveDatabase(database);
        return {};
    }
    const record = { ...body, userId: currentUser.id, id: item?.id || crypto.randomUUID() };
    if (item) collection.splice(collection.indexOf(item), 1, record);
    else collection.push(record);
    saveDatabase(database);
    return structuredClone(record);
}
