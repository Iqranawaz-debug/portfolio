const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const outputDir = path.resolve('test-results');
fs.mkdirSync(outputDir, {recursive: true});
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const results = [];
  for (const width of [320,375,430,768,1024,1280,1440,1920]) {
    await page.setViewportSize({width,height:900});
    await page.goto('http://127.0.0.1:4173');
    await page.locator('h1').waitFor();
    const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.classList.contains('skip-link') && !e.classList.contains('sr-only');
    }).map(e => e.tagName + '.' + e.className));
    assert.deepEqual(overflow, [], `Overflow at ${width}: ${overflow}`);
    assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete && i.naturalWidth>0)),true);
    if (width<=900) {
      await page.getByRole('button',{name:'Menu'}).click();
      await page.getByRole('navigation').getByRole('link',{name:'Projects',exact:true}).click();
      assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'false');
      assert.equal(await page.locator('#projects').evaluate(e=>document.activeElement===e),true);
      const menuBox = await page.getByRole('button',{name:'Menu'}).boundingBox();
      await page.mouse.click(menuBox.x+menuBox.width/2,menuBox.y+menuBox.height/2);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#menuToggle').evaluate(e=>document.activeElement===e),true);
      assert.equal(await page.locator('#navMenu').isVisible(),false);
    } else {
      await page.getByRole('navigation').getByRole('link',{name:'Projects',exact:true}).click();
    }
    await page.waitForFunction(()=>document.querySelector('.nav-link[href="#projects"]').getAttribute('aria-current')==='location');
    for (const detail of await page.locator('details').all()) {
      await detail.locator('summary').click();
      assert.equal(await detail.getAttribute('open'),'');
      await detail.locator('summary').click();
    }
    await page.getByRole('navigation').getByRole('link',{name:'Iqra Nawaz, home'}).click();
    await page.screenshot({path:path.join(outputDir,`portfolio-${width}.png`),fullPage:true});
    results.push({width,overflow:false,menu:'pass',projects:'pass'});
  }
  await page.setViewportSize({width:375,height:800});
  await page.goto('http://127.0.0.1:4173');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(e=>document.activeElement===e),true);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('main').evaluate(e=>document.activeElement===e),true);
  const [download] = await Promise.all([page.waitForEvent('download'),page.getByRole('link',{name:/Download CV/}).click()]);
  assert.equal(download.suggestedFilename(),'Iqra-Nawaz-CV.docx');
  assert.equal(await download.failure(),null);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  await page.getByRole('button',{name:'Menu'}).click();
  await page.setViewportSize({width:1280,height:900});
  assert.equal(await page.locator('#navMenu').isVisible(),true);
  assert.equal(await page.locator('#menuToggle').isVisible(),false);
  const noJS = await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:800}});
  await noJS.goto('http://127.0.0.1:4173');
  assert.equal(await noJS.locator('#navMenu').isVisible(),true);
  assert.equal(await noJS.locator('#projects').isVisible(),true);
  await noJS.close();
  const response=await page.request.get('http://127.0.0.1:4173/missing');
  assert.equal(response.status(),404);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(outputDir,'browser-results.json'),JSON.stringify({results,errors,cvDownload:'pass',keyboard:'pass',reducedMotion:'pass',noJavaScript:'pass',resize:'pass',notFound:'pass'},null,2));
  console.log(JSON.stringify({results,errors,additional:'CV download, keyboard, reduced motion, no-JS, resize and 404 passed'},null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


