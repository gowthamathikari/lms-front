const esbuild = require('esbuild');
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
 const result = await esbuild.build({
  stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {UpsurgeSearchDialog} from './components/public/upsurge-search-dialog'; import {UpsurgeProfileForm} from './components/public/upsurge-profile-form'; import styles from './components/public/upsurge-profile.module.css'; import {UpsurgeCourseDetails} from './components/public/upsurge-course-details'; import courses from './components/public/upsurge-catalog-data.json';
  const profile = {full_name:'Gowtham',avatar_url:null}; const account = {id:'test-user',email:'test@example.com',phone:'+91861234738',phoneVerified:true,emailVerified:true,gender:''};
  createRoot(document.getElementById('root')).render(location.pathname === '/course' ? <UpsurgeCourseDetails course={courses.find(c=>c.slug==='passive-income-through-options-selling')} locale='en'/> : location.pathname === '/profile' ? <div className={styles.page}><nav className={styles.sidebar}><a aria-current='page'>Edit Profile</a><a>My Certificates</a><a>My Purchases</a><a>My Tickets</a></nav><section className={styles.content}><UpsurgeProfileForm profile={profile} account={account}/></section></div> : <main><header><strong>Upsurge.club</strong><UpsurgeSearchDialog catalog='/en/courses' fontClassName='font'/></header><h1>My Learning</h1><p>Isolated component preview with fixture data</p></main>);`, resolveDir: process.cwd(), loader:'tsx' },
  jsx:'automatic', bundle:true, write:false, outdir:'preview', loader:{'.css':'local-css'}, define:{'process.env.NODE_ENV':'"production"'},
  plugins:[{name:'preview-adapters',setup(build){
   build.onResolve({filter:/^next\/(navigation|image|link)$/}, args=>({path:args.path,namespace:'preview'}));
   build.onResolve({filter:/^@\/lib\/supabase\/client$/}, args=>({path:args.path,namespace:'preview'}));
   build.onLoad({filter:/.*/,namespace:'preview'}, args=>({resolveDir:process.cwd(),loader:'jsx',contents: args.path === 'next/link' ? "import React from 'react'; export default function Link(props){return <a {...props}/>} " : args.path === 'next/image' ? `import React from 'react'; export default function Image({unoptimized,priority,fill,...props}) {return <img {...props}/>}` : args.path === 'next/navigation' ? `export function useRouter(){return {push(url){window.__navigation=url}, refresh(){}}}` : `export function createClient(){return {from(){return {update(value){window.__savedProfile=value; return {eq(key,id){window.__savedId=id;return {select(){return {async single(){return window.__failSave ? {data:null,error:{message:'failed'}} : {data:{id},error:null}}}}}}}}}},auth:{async updateUser(value){window.__savedAuth=value;return {error:null}}}}}` }));
  }}]
 });
 const js = result.outputFiles.find(file=>file.path.endsWith('.js')).contents;
 const css = result.outputFiles.find(file=>file.path.endsWith('.css')).contents;
 const html = `<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'><link rel='stylesheet' href='/bundle.css'><style>@font-face{font-family:Figtree;src:url('/upsurge/figtree-400.ttf')}*{box-sizing:border-box}body{margin:0;font-family:Figtree,sans-serif;background:#fafafe}button,input{font:inherit}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.font{--font-upsurge:Figtree}header{display:flex;flex-wrap:wrap;align-items:center;padding:30px;gap:60px;border-bottom:1px solid #ddd}main>h1,main>p{margin:40px}main{min-height:100vh}[data-slot=dialog-overlay]{position:fixed;inset:0;z-index:50}[data-slot=avatar]{display:flex;border-radius:50%;overflow:hidden}[data-slot=avatar-fallback]{display:flex;align-items:center;justify-content:center;width:100%;height:100%}[data-slot=avatar-image]{width:100%;height:100%;object-fit:cover}[data-slot=field]{display:flex;flex-direction:column;gap:12px}[data-slot=field-group]{display:flex;flex-direction:column}fieldset{border:0;padding:0}</style></head><body><div id='root'></div><script src='/bundle.js'></script></body></html>`;
 const server = http.createServer((req,res)=>{
  if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(js)}
  else if(req.url==='/bundle.css'){res.setHeader('Content-Type','text/css');res.end(css)}
  else if(req.url.startsWith('/upsurge/')){const file=path.resolve('public','.'+req.url);if(file.startsWith(path.resolve('public')+path.sep)&&fs.existsSync(file)){res.end(fs.readFileSync(file))}else{res.statusCode=404;res.end()}}
  else{res.setHeader('Content-Type','text/html');res.end(html)}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}); const errors=[];page.on('pageerror',error=>{errors.push(error.message);console.error(error.message)});
  await page.goto(base); await page.getByRole('button',{name:'Search courses',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Search courses'});await dialog.waitFor();
  assert.equal(await page.locator('#course-search-query').evaluate(el=>el===document.activeElement),true);
  await page.screenshot({path:'docs/verification/upsurge-course-details/search-desktop.png'});
  await page.locator('#course-search-query').fill('renko');assert.ok(await dialog.getByRole('link',{name:/Option Buying/}).count());
  await page.locator('#course-search-query').fill('zzzzzz');await page.getByText('No courses found for').waitFor();
  await page.locator('#course-search-query').fill('renko');await page.getByRole('button',{name:'View search results'}).click();
  assert.equal(await page.evaluate(()=>window.__navigation),'/en/courses?search=renko');
  await page.getByRole('button',{name:'Search courses',exact:true}).click();await page.locator('#course-search-query').fill('');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/verification/upsurge-course-details/search-mobile.png'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.match(await page.getByRole('link',{name:'Stock Market Investing',exact:true}).getAttribute('href'),/category=Stock%20Market%20Investing/);
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  await page.goto(base+'/profile');await page.setViewportSize({width:1440,height:1000});await page.locator('#profile-name').waitFor();
  await page.screenshot({path:'docs/verification/upsurge-course-details/profile-desktop.png'});
  await page.locator('#profile-name').fill('');await page.getByRole('button',{name:'Save Changes'}).click();assert.equal(await page.locator('#profile-name').evaluate(el=>el.validity.valueMissing),true);
  await page.locator('#profile-name').fill('Updated Name');await page.getByRole('radio',{name:'Female',exact:true}).check();await page.getByRole('button',{name:'Save Changes'}).click();await page.getByRole('status').waitFor();
  assert.deepEqual(await page.evaluate(()=>window.__savedProfile),{full_name:'Updated Name',avatar_url:null});assert.equal(await page.evaluate(()=>window.__savedId),'test-user');assert.equal(await page.evaluate(()=>window.__savedAuth.data.gender),'Female');
  await page.evaluate(()=>window.__failSave=true);await page.getByRole('button',{name:'Save Changes'}).click();await page.getByRole('alert').waitFor();
  await page.locator('input[type=file]').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('bad')});await page.getByText('Choose a JPG, PNG or WebP image smaller than 5 MB.').waitFor();
  await page.locator('input[type=file]').setInputFiles('public/upsurge/catalog-trilok.webp');await page.waitForFunction(()=>!!document.querySelector('[data-slot=avatar-image]'));
  await page.evaluate(()=>window.__failSave=false);await page.getByRole('button',{name:'Save Changes'}).click();await page.getByRole('status').waitFor();assert.match(await page.evaluate(()=>window.__savedProfile.avatar_url),/^data:image\/webp/);
  await page.locator('#profile-email').fill('new@example.com');await page.getByRole('button',{name:'Update Email'}).click();await page.getByText('Check your email to confirm').waitFor();assert.equal(await page.evaluate(()=>window.__savedAuth.email),'new@example.com');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/verification/upsurge-course-details/profile-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.goto(base+'/course'); await page.setViewportSize({width:1440,height:1000}); await page.getByRole('heading',{name:'Passive Income through Options Selling',level:1}).waitFor(); await page.screenshot({path:'docs/verification/upsurge-course-details/detail-desktop.png',fullPage:true}); await page.setViewportSize({width:390,height:844}); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true); await page.screenshot({path:'docs/verification/upsurge-course-details/detail-mobile.png',fullPage:true}); assert.equal(await page.getByRole('link',{name:'Explore PRO plans'}).getAttribute('href'),'/en/pricing'); assert.equal(await page.locator('a[href^="https://www.upsurge.club"]').count(),0); assert.deepEqual(errors,[]);console.log('PASS: search focus/filter/empty/submit/category/Escape/mobile; profile required-name/save/error/gender/image/email/mobile. Supabase and router mocked; local course detail desktop/mobile/PRO links passed.');
 } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exit(1)});





