const {spawn}=require('child_process');
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'finderjobs-test-'));
const db=path.join(temp,'db.json');fs.copyFileSync(path.join(__dirname,'db.json'),db);
const port=3107;
const server=spawn(process.execPath,['server.cjs'],{cwd:__dirname,env:{...process.env,DB_FILE:db,PORT:String(port)},stdio:['ignore','pipe','pipe']});
const base='http://127.0.0.1:'+port;
async function req(route,method='GET',body,token,expected=200){
 const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();assert.equal(r.status,expected,route+': '+JSON.stringify(data));return data;
}
(async()=>{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.stderr.on('data',d=>reject(Error(String(d))));});
 await req('/resumes','GET',null,null,401);
 await req('/vacancies');
 const register=role=>req('/register','POST',{email:role+'@test.local',password:'test1234',firstname:'Тест',lastname:'Пользователь',role},null,201);
 const candidate=await register('candidate'),employer=await register('employer');
 const ct=candidate.accessToken,et=employer.accessToken;
 await req('/login','POST',{email:'candidate@test.local',password:'wrong'},null,400);
 await req('/login','POST',{email:'candidate@test.local',password:'test1234'});
 await req('/me','GET',null,ct);
 const resume=await req('/resumes','POST',{title:'Разработчик',skills:'JavaScript',city:'СПб',education:'ИТМО',experience:'Без опыта',salary:80000},ct,201);
 await req('/resumes/'+resume.id,'PUT',{...resume,skills:'Vue'},ct);
 const vacancy=await req('/vacancies','POST',{title:'Тестовая вакансия',companyName:'Тест',industry:'IT',salary:150000,experience:'Без опыта',description:'Описание',requirements:['HTML']},et,201);
 const filtered=await req('/vacancies?industry=IT&salary_gte=140000&experience='+encodeURIComponent('Без опыта'),'GET',null,ct);
 assert(filtered.some(v=>v.id===vacancy.id));
 await req('/vacancies/'+vacancy.id,'PUT',{...vacancy,title:'Изменено'},et);
 await req('/vacancies/'+vacancy.id,'DELETE',null,ct,403);
 await req('/applications','POST',{vacancyId:vacancy.id},ct,201);
 await req('/applications','POST',{vacancyId:vacancy.id},ct,409);
 const apps=await req('/applications','GET',null,et);assert.equal(apps.length,1);
 const second=await req('/register','POST',{email:'other@test.local',password:'test1234',firstname:'Другой',lastname:'Тест',role:'employer'},null,201);
 await req('/vacancies/'+vacancy.id,'PUT',{...vacancy,title:'Чужое'},second.accessToken,403);
 const hidden=await req('/applications','GET',null,second.accessToken);assert.equal(hidden.length,0);
 await req('/vacancies/'+vacancy.id,'DELETE',null,et);
 await req('/vacancies/'+vacancy.id,'GET',null,ct,404);
 console.log('PASS: регистрация, вход, токен, резюме, фильтры, CRUD вакансии, отклик, дубликат, разграничение доступа.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{server.kill();});

