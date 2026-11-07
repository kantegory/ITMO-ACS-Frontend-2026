const bcrypt = require('bcryptjs');
const SECRET_KEY = process.env.JWT_SECRET || 'jobhub_secret_key_2026';

const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const expiresIn = '24h';

server.use(middlewares);
server.use(bodyParser.json());


function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}


function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}


function isAuthenticated({ email, password }) {
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();
  return user !== undefined ? user : false;
}


server.post('/api/register', (req, res) => {
  const { email, password, role, firstName, lastName, phone, companyName, companyIndustry } = req.body;

  const db = router.db;
  const existingUser = db.get('users').find({ email }).value();

  if (existingUser) {
    return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
  if (!email || !password || password.length < 6)
    return res.status(400).json({ message: 'Email и пароль (от 6 символов) обязательны' });
  if (!['jobseeker', 'employer'].includes(role))
    return res.status(400).json({ message: 'Неверная роль' });
  if (role === 'jobseeker' && (!firstName || !lastName))
    return res.status(400).json({ message: 'Укажите имя и фамилию' });
  if (role === 'employer' && !companyName)
    return res.status(400).json({ message: 'Укажите название компании' });
  }
  const newUser = {
    id: Date.now(),
    email,
    password: bcrypt.hashSync(password, 10),
    role,
    ...(role === 'jobseeker' ? {
      firstName,
      lastName,
      phone,
      city: '',
      avatar: `${firstName[0]}${lastName[0]}`,
      skills: [],
      experience: '0',
      stats: { resumeViews: 0, applications: 0, favorites: 0 }
    } : {
      companyName,
      companyLogo: companyName[0],
      companyIndustry,
      companyDescription: '',
      stats: { vacancies: 0, activeVacancies: 0, views: 0, applications: 0, conversion: 0 }
    })
  };

  db.get('users').push(newUser).write();

  const token = createToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({ token, user: userWithoutPassword });
});


server.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = router.db.get('users').find({ email }).value();

  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }
  const token = createToken({ id: user.id, email: user.email, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json({ token, user: userWithoutPassword });
});


server.use(/^(?!\/api\/(login|register)).*$/, (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {

    if (req.method === 'GET') {
      return next();
    }
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Невалидный токен' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Ошибка авторизации' });
  }
});

server.get('/api/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const db = router.db;
  const user = db.get('users').find({ id: req.user.id }).value();

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});


server.post('/api/applications', (req, res) => {
  if (!req.user || req.user.role !== 'jobseeker') {
    return res.status(403).json({ message: 'Доступно только для соискателей' });
  }

  const { vacancyId, coverLetter } = req.body;
  const db = router.db;

  const vacancy = db.get('vacancies').find({ id: parseInt(vacancyId) }).value();
  if (!vacancy) {
    return res.status(404).json({ message: 'Вакансия не найдена' });
  }

  const existingApplication = db.get('applications')
    .find({ userId: req.user.id, vacancyId: parseInt(vacancyId) })
    .value();

  if (existingApplication) {
    return res.status(400).json({ message: 'Вы уже откликнулись на эту вакансию' });
  }

  const newApplication = {
    id: Date.now(),
    userId: req.user.id,
    vacancyId: parseInt(vacancyId),
    vacancyTitle: vacancy.title,
    companyName: vacancy.companyName,
    status: 'pending',
    appliedDate: new Date().toISOString().split('T')[0],
    coverLetter: coverLetter || ''
  };

  db.get('applications').push(newApplication).write();


  db.get('vacancies')
    .find({ id: parseInt(vacancyId) })
    .assign({ applicationsCount: (vacancy.applicationsCount || 0) + 1 })
    .write();

  res.status(201).json(newApplication);
});


server.post('/api/favorites', (req, res) => {
  if (!req.user || req.user.role !== 'jobseeker') {
    return res.status(403).json({ message: 'Доступно только для соискателей' });
  }

  const { vacancyId } = req.body;
  const db = router.db;

  const existingFavorite = db.get('favorites')
    .find({ userId: req.user.id, vacancyId: parseInt(vacancyId) })
    .value();

  if (existingFavorite) {
    return res.status(400).json({ message: 'Вакансия уже в избранном' });
  }

  const newFavorite = {
    id: Date.now(),
    userId: req.user.id,
    vacancyId: parseInt(vacancyId)
  };

  db.get('favorites').push(newFavorite).write();
  res.status(201).json(newFavorite);
});


server.delete('/api/favorites/:vacancyId', (req, res) => {
  if (!req.user || req.user.role !== 'jobseeker') {
    return res.status(403).json({ message: 'Доступно только для соискателей' });
  }

  const vacancyId = parseInt(req.params.vacancyId);
  const db = router.db;

  const favorite = db.get('favorites')
    .find({ userId: req.user.id, vacancyId })
    .value();

  if (!favorite) {
    return res.status(404).json({ message: 'Вакансия не найдена в избранном' });
  }

  db.get('favorites').remove({ id: favorite.id }).write();
  res.status(200).json({ message: 'Удалено из избранного' });
});

server.get('/api/vacancies/search', (req, res) => {
  const { keyword, industry, salaryFrom, experience, remote } = req.query;
  const db = router.db;

  let vacancies = db.get('vacancies').value();

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    vacancies = vacancies.filter(v =>
      v.title.toLowerCase().includes(lowerKeyword) ||
      v.description.toLowerCase().includes(lowerKeyword)
    );
  }

  if (industry && industry !== '') {
    vacancies = vacancies.filter(v => v.industry === industry);
  }

  if (salaryFrom) {
    const minSalary = parseInt(salaryFrom);
    vacancies = vacancies.filter(v => v.salaryFrom && v.salaryFrom >= minSalary);
  }

  if (experience) {
    vacancies = vacancies.filter(v => v.experience === experience);
  }

  if (remote === 'true') {
    vacancies = vacancies.filter(v => v.workFormat === 'remote');
  }

  res.status(200).json(vacancies);
});

server.all('/api/users*', (req, res) => res.status(403).json({ message: 'Доступ запрещён' }));

server.use('/api', (req, res, next) => {
  const [, resource, id] = req.path.split('/'); 

  if (['applications', 'favorites'].includes(resource)) {
    if (!req.user) return res.status(401).json({ message: 'Требуется авторизация' });
    if (req.method === 'GET' && req.user.role === 'jobseeker') {
      req.query.userId = String(req.user.id);
    }
    return req.method === 'GET' ? next() : res.status(403).json({ message: 'Операция запрещена' });
  }

  if (req.method === 'GET') return next();        


  if (resource === 'vacancies') {
    if (!req.user || req.user.role !== 'employer')
      return res.status(403).json({ message: 'Только для работодателей' });

    if (req.method === 'POST') {
      req.body.companyId = req.user.id;
    } else {
      const v = router.db.get('vacancies').find({ id: Number(id) }).value();
      if (!v || v.companyId !== req.user.id)
        return res.status(403).json({ message: 'Это не ваша вакансия' });
    }
    return next();
  }

  return res.status(403).json({ message: 'Операция запрещена' });
});

server.use('/api', router);  

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server запущен на http://localhost:${PORT}`);
  console.log(`📊 База данных: db.json`);
  console.log(`🔐 API маршруты:`);
  console.log(`   POST /api/register - Регистрация`);
  console.log(`   POST /api/login - Вход`);
  console.log(`   GET  /api/me - Текущий пользователь`);
  console.log(`   GET  /api/vacancies - Все вакансии`);
  console.log(`   GET  /api/vacancies/search - Поиск вакансий`);
  console.log(`   POST /api/applications - Отклик на вакансию`);
  console.log(`   POST /api/favorites - Добавить в избранное`);
  console.log(`   DELETE /api/favorites/:id - Удалить из избранного`);
});
