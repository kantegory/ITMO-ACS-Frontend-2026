const base='http://127.0.0.1:3000';
async function call(route,body,token,method='POST'){
 const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const d=await r.json();if(!r.ok)throw Error(JSON.stringify(d));return d;
}
async function account(email,role,firstname,lastname){
 try{return await call('/register',{email,password:'Test1234!',role,firstname,lastname});}
 catch{return await call('/login',{email,password:'Test1234!'});}
}
(async()=>{
 const employer=await account('employer@example.com','employer','Анна','Соколова');
 const candidate=await account('candidate@example.com','candidate','Анастасия','Маркозубова');
 const et=employer.accessToken,ct=candidate.accessToken;
 const old=await call('/vacancies?userId='+employer.user.id,null,et,'GET');
 const vacancies=[
 {title:'QA-инженер',salary:110000,industry:'IT',experience:'От 1 года',description:'Ручное тестирование веб-приложений и проверка REST API.',requirements:['Тест-дизайн','Postman','SQL']},
 {title:'UX/UI-дизайнер',salary:125000,industry:'IT',experience:'От 1 года',description:'Проектирование удобных интерфейсов и подготовка макетов.',requirements:['Figma','Прототипирование','Портфолио']},
 {title:'Стажёр JavaScript-разработчик',salary:60000,industry:'IT',experience:'Без опыта',description:'Разработка небольших функций под руководством наставника.',requirements:['Основы JavaScript','HTML','Git']},
 {title:'Vue-разработчик',salary:170000,industry:'IT',experience:'От 3 лет',description:'Разработка SPA на Vue 3 и интеграция с API.',requirements:['Vue 3','Vue Router','REST API']},
 {title:'Контент-менеджер',salary:65000,industry:'Маркетинг',experience:'Без опыта',description:'Подготовка и публикация материалов на сайте компании.',requirements:['Грамотный русский язык','Внимательность','Работа с текстами']},
 {title:'Интернет-маркетолог',salary:140000,industry:'Маркетинг',experience:'От 3 лет',description:'Планирование рекламы, анализ конверсии и развитие каналов продвижения.',requirements:['Веб-аналитика','Реклама','Планирование бюджета']},
 {title:'Ассистент менеджера проектов',salary:55000,industry:'Управление',experience:'Без опыта',description:'Помощь в ведении задач и подготовке проектной документации.',requirements:['Организованность','Деловая переписка','Таблицы']},
 {title:'Менеджер продукта',salary:200000,industry:'Управление',experience:'От 3 лет',description:'Развитие продукта, исследование потребностей и управление приоритетами.',requirements:['Продуктовая аналитика','Исследования','Работа с командой']},
 {title:'Junior Frontend-разработчик',salary:90000,industry:'IT',experience:'Без опыта',description:'Разработка страниц на HTML, CSS и JavaScript. Помощь наставника и гибкий график.',requirements:['HTML и CSS','Основы JavaScript','Готовность учиться']},
 {title:'Backend-разработчик Node.js',salary:180000,industry:'IT',experience:'От 3 лет',description:'Разработка REST API и интеграций, работа с базами данных.',requirements:['Node.js','SQL','Git']},
 {title:'SMM-специалист',salary:75000,industry:'Маркетинг',experience:'От 1 года',description:'Ведение социальных сетей и подготовка контент-плана.',requirements:['Копирайтинг','Анализ статистики','Работа с контентом']},
 {title:'Менеджер проектов',salary:130000,industry:'Управление',experience:'От 3 лет',description:'Планирование задач, координация команды и общение с заказчиками.',requirements:['Планирование','Коммуникация','Управление рисками']}
 ];
 for(const v of vacancies)if(!old.some(x=>x.title===v.title))await call('/vacancies',{...v,companyName:'ООО «Айти Технологии»'},et);
 const resumes=await call('/resumes',null,ct,'GET');
 if(!resumes.length)await call('/resumes',{title:'Frontend-разработчик',candidateName:'Анастасия Маркозубова',salary:80000,city:'Санкт-Петербург',skills:'HTML, CSS, Bootstrap, JavaScript, Git',education:'Университет ИТМО',experience:'Учебные проекты: сайт поиска работы и REST API'},ct);
 const login=await call('/login',{email:'candidate@example.com',password:'Test1234!'});
 if(!login.accessToken)throw Error('Нет токена');
 console.log('Готово: два аккаунта, четыре вакансии работодателя, резюме соискателя. Вход проверен.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});

