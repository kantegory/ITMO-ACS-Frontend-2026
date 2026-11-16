const {chromium}=require('playwright');
const {spawn}=require('child_process');
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'finderjobs-browser-'));
const db=path.join(tmp,'db.json');fs.copyFileSync(path.join(__dirname,'db.json'),db);
const server=spawn(process.execPath,['server.cjs'],{cwd:__dirname,env:{...process.env,DB_FILE:db},stdio:['ignore','pipe','pipe']});
let browser;
(async()=>{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(Error(String(d))));});
 browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:3000/';
 await p.goto(base+'profile.html');await p.waitForURL('**/login.html');
 async function register(role){
 await p.goto(base+'register.html');
 await p.locator('#firstName').fill('Тест');await p.locator('#lastName').fill('Пользователь');
 await p.locator('#email').fill(role+'@browser.local');await p.locator('#role').selectOption(role);
 await p.locator('#password').fill('test1234');await p.locator('#passwordConfirm').fill('test1234');
 await p.locator('button[type=submit]').click();await p.waitForURL('**/'+(role==='employer'?'employer.html':'profile.html'));
 }
 await register('employer');await p.locator('#title').fill('Браузерная вакансия');await p.locator('#companyName').fill('Тестовая компания');
 await p.locator('#salary').fill('160000');await p.locator('#description').fill('Описание вакансии');
 await p.locator('#requirements').fill('HTML\nJavaScript');await p.locator('button[type=submit]').click();
 await p.getByText('Вакансия сохранена.',{exact:true}).waitFor();
 await p.locator('#logout').click();await register('candidate');
 for(const [id,value] of Object.entries({title:'Разработчик',city:'СПб',salary:'100000',skills:'JavaScript',education:'ИТМО',experience:'Учебные проекты'}))await p.locator('#'+id).fill(value);
 await p.locator('button[type=submit]').click();await p.getByText('Резюме сохранено.',{exact:true}).waitFor();
 await p.goto(base+'job-search.html');await p.locator('#query').fill('Браузерная');await p.locator('#salary').fill('150000');
 await p.locator('button[type=submit]').click();await p.getByText('Найдено: 1',{exact:true}).waitFor();
 await p.getByText('Подробнее',{exact:true}).click();await p.locator('#apply').click();await p.getByText('Отклик отправлен.',{exact:true}).waitFor();
 await p.setViewportSize({width:375,height:812});await p.goto(base+'profile.html');await p.locator('#resume').waitFor();
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);
 console.log('PASS UI: редирект без входа, регистрация двух ролей, создание вакансии, резюме, фильтры, детали, отклик, мобильная ширина; ошибок JS нет.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});

