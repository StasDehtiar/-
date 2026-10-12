const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const {chromium,firefox}=require('playwright');
const root=path.resolve('studyflow'),out=path.resolve('browser-artifacts');fs.mkdirSync(out,{recursive:true});
const type={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{try{const p=path.join(root,decodeURIComponent(req.url.split('?')[0]));res.setHeader('Content-Type',type[path.extname(p)]||'text/plain');res.end(fs.readFileSync(p));}catch{res.writeHead(404);res.end();}});
(async()=>{
 await new Promise(resolve=>server.listen(8000,'127.0.0.1',resolve));
 const name=process.argv[2];const browser=name==='firefox'?await firefox.launch():await chromium.launch({channel:name});
 const context=await browser.newContext({locale:'uk-UA'}),page=await context.newPage();const checks=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const lab of [2,3,4])for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:width<700?844:900});
  for(const file of ['index','tasks','calendar','about','contacts']){
   await page.goto(`http://127.0.0.1:8000/Lab${lab}_StudyFlow/${file}.html`,{waitUntil:'networkidle'});
   assert.equal(await page.locator('h1').count(),1);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   if(lab>=3)assert.equal(overflow,false,`${name}/lab${lab}/${file}/${width}: overflow`);
   checks.push({lab,file,width,overflow,passed:true});
   if(file==='index'&&[1440,768,390].includes(width))await page.screenshot({path:path.join(out,`${name}-lab${lab}-${file}-${width}.png`)});
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:8000/Lab4_StudyFlow/contacts.html');
 await page.locator('#contact-form button[type=submit]').click();assert.equal(await page.locator('.field-error').evaluateAll(es=>es.filter(e=>e.textContent).length),5);
 await page.screenshot({path:path.join(out,`${name}-lab4-form-errors.png`)});
 await page.locator('#name').fill('Станіслав');await page.locator('#email').fill('student@example.com');await page.locator('#topic').selectOption('idea');await page.locator('#message').fill('Тестове повідомлення для перевірки StudyFlow.');await page.locator('#consent').check();await page.locator('#contact-form button[type=submit]').click();
 assert.ok((await page.locator('#form-result').textContent()).includes('Форма успішно надіслана!'));assert.equal(await page.locator('#name').inputValue(),'');
 await page.screenshot({path:path.join(out,`${name}-lab4-form-success.png`)});
 checks.push({test:'JS form errors/success/reset',passed:true});
 await page.goto('http://127.0.0.1:8000/Lab4_StudyFlow/index.html');await page.locator('#theme-toggle').click();await page.reload();assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('dark-theme')));await page.screenshot({path:path.join(out,`${name}-lab4-dark-theme.png`)});await page.locator('#theme-toggle').click();
 await page.locator('#theme-toggle').focus();await page.locator('#theme-toggle').press('ArrowUp');assert.equal(await page.locator('html').evaluate(e=>e.style.fontSize),'17px');await page.locator('#theme-toggle').press('ArrowDown');assert.equal(await page.locator('html').evaluate(e=>e.style.fontSize),'16px');checks.push({test:'font arrows while button focused',passed:true});
 await page.locator('#more-toggle').click();assert.ok(await page.locator('#more-content').isVisible());checks.push({test:'persistent theme and accordion',passed:true});
 await page.goto('http://127.0.0.1:8000/Lab4_StudyFlow/tasks.html');await page.locator('#task-title').fill('Лабораторна робота 4');await page.locator('#task-subject').fill('Вебтехнології');await page.locator('#task-due').fill('2026-10-20');await page.locator('#task-form button[type=submit]').click();assert.equal(await page.locator('.task-item').count(),1);await page.reload();assert.equal(await page.locator('.task-item').count(),1);await page.screenshot({path:path.join(out,`${name}-lab4-tasks.png`)});checks.push({test:'tasks add and persist',passed:true});
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,`${name}-results.json`),JSON.stringify({browser:name,version:await browser.version(),userAgent:await page.evaluate(()=>navigator.userAgent),tested_at:new Date().toISOString(),checks,errors},null,2));
 console.log(`${name}: ${checks.length} checks passed`);await browser.close();server.close();
})().catch(error=>{console.error(error);fs.writeFileSync(path.join(out,'failure.txt'),String(error));server.close();process.exit(1)});
