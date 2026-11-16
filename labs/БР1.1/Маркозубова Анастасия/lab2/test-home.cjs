const {chromium}=require('playwright'),{spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'finderjobs-home-')),db=path.join(dir,'db.json');fs.copyFileSync('db.json',db);
const server=spawn(process.execPath,['server.cjs'],{env:{...process.env,PORT:'3108',DB_FILE:db},stdio:['ignore','pipe','pipe']});
let browser;
(async()=>{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(Error(String(d))));});
 browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('http://127.0.0.1:3000/**',route=>route.continue({url:route.request().url().replace(':3000',':3108')}));
 await p.goto('http://127.0.0.1:3108/index.html');await p.locator('.vacancy-preview').first().waitFor();
 assert((await p.locator('.vacancy-preview a').first().getAttribute('href')).startsWith('login.html?next='));
 const r=await fetch('http://127.0.0.1:3108/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'home@test.local',password:'test1234',firstname:'Тест',lastname:'Тест',role:'candidate'})});const auth=await r.json();
 await p.evaluate(t=>localStorage.setItem('accessToken',t),auth.accessToken);await p.reload();await p.locator('#logout').waitFor();
 const link=await p.locator('.vacancy-preview a').first().getAttribute('href');assert(link.startsWith('vacancy.html?id='));
 await p.locator('.vacancy-preview a').first().click();await p.locator('#apply').waitFor();
 await p.goto('http://127.0.0.1:3108/index.html');await p.setViewportSize({width:375,height:812});await p.locator('.vacancy-preview').first().waitFor();
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 console.log('PASS: карточки из API, ссылки гостя, прямой переход после входа, мобильная ширина 375 px, без ошибок JS.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});

