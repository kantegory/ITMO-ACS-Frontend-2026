const base='http://127.0.0.1:3000';
async function call(path,method='GET',body,token){
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();if(!r.ok)throw Error(typeof data==='string'?data:data.message);return data;
}
const candidates=[
 ['Иван','Петров','Frontend-разработчик','Москва',110000,'HTML, CSS, JavaScript, React, Git','Московский политехнический университет','2 года: разработка интерфейсов интернет-магазина'],
 ['Мария','Смирнова','UX/UI-дизайнер','Санкт-Петербург',95000,'Figma, прототипирование, дизайн-системы, UX-исследования','СПбГУПТД, дизайн','1 год: макеты мобильных приложений и лендингов'],
 ['Алексей','Волков','Backend-разработчик Node.js','Казань',180000,'Node.js, Express, PostgreSQL, Docker, REST API','КФУ, прикладная информатика','4 года: серверные приложения и интеграции'],
 ['Дарья','Кузнецова','QA-инженер','Новосибирск',85000,'Postman, SQL, тест-кейсы, DevTools, Jira','НГТУ, информационные системы','1 год: ручное тестирование веб-приложений'],
 ['Егор','Морозов','Стажёр JavaScript-разработчик','Екатеринбург',50000,'JavaScript, HTML, CSS, Bootstrap, Git','УрФУ, программная инженерия, студент','Без коммерческого опыта. Учебные проекты: каталог товаров и список задач'],
 ['Полина','Орлова','SMM-специалист','Санкт-Петербург',75000,'Контент-план, копирайтинг, VK, аналитика, Canva','СПбГУ, реклама и связи с общественностью','2 года: ведение социальных сетей локальных брендов'],
 ['Дмитрий','Соколов','Менеджер проектов','Москва',150000,'Scrum, Kanban, управление командой, Jira, планирование','НИУ ВШЭ, менеджмент','5 лет: управление командами разработки до 10 человек'],
 ['Анна','Лебедева','Контент-менеджер','Пермь',55000,'Редактирование, CMS, HTML, подготовка изображений','ПГНИУ, филология','Без коммерческого опыта. Ведение студенческого медиапроекта'],
 ['Никита','Фёдоров','Vue-разработчик','Нижний Новгород',160000,'Vue 3, Pinia, Vue Router, TypeScript, Axios','ННГУ, прикладная математика','3 года: личные кабинеты и CRM-системы'],
 ['София','Белова','Интернет-маркетолог','Самара',120000,'Яндекс Директ, Метрика, SEO, Excel, рекламные кампании','Самарский университет, маркетинг','3 года: продвижение интернет-магазинов'],
 ['Артём','Зайцев','QA Automation Engineer','Томск',170000,'Playwright, JavaScript, Python, API, CI/CD','ТГУ, информатика','4 года: автоматизация тестирования веб-сервисов'],
 ['Елена','Новикова','Ассистент менеджера проектов','Краснодар',60000,'Деловая переписка, Excel, протоколы встреч, Trello','КубГУ, управление','1 год: сопровождение проектов и подготовка документов']
];
(async()=>{
 let added=0;
 for(let i=0;i<candidates.length;i++){
  const [firstname,lastname,title,city,salary,skills,education,experience]=candidates[i];
  const email='resume'+(i+1)+'@example.com',password='Test1234!';
  let auth;
  try{auth=await call('/register','POST',{email,password,firstname,lastname,role:'candidate'});}
  catch{auth=await call('/login','POST',{email,password});}
  const resumes=await call('/resumes','GET',null,auth.accessToken);
  if(resumes.length)continue;
  await call('/resumes','POST',{candidateName:firstname+' '+lastname,title,city,salary,skills,education,experience},auth.accessToken);
  added++;
 }
 const employer=await call('/login','POST',{email:'employer@example.com',password:'Test1234!'});
 const resumes=await call('/resumes','GET',null,employer.accessToken);
 if(!candidates.every(c=>resumes.some(r=>r.candidateName===c[0]+' '+c[1])))throw Error('Не все резюме доступны работодателю');
 console.log('Добавлено резюме: '+added+'. Всего доступно работодателю: '+resumes.length+'. Проверка выполнена.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});

