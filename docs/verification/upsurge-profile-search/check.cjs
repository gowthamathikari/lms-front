const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 try {
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
 const errors = []; page.on('pageerror', error => errors.push(error.message));
 await page.goto('http://localhost:3000/en', { waitUntil: 'domcontentloaded', timeout: 120000 });
 const trigger = page.getByRole('button', { name: 'Search courses', exact: true });
 await trigger.click({ timeout: 60000 });
 const dialog = page.getByRole('dialog', { name: 'Search courses' });
 await dialog.waitFor();
 await page.screenshot({ path: 'docs/verification/upsurge-profile-search/search-desktop.png' });
 assert.equal(await page.locator('#course-search-query').evaluate(el => el === document.activeElement), true, 'autofocus');
 await page.locator('#course-search-query').fill('renko');
 await page.getByRole('heading', { name: 'Search results', exact: true }).waitFor();
 assert.ok(await dialog.getByRole('link', { name: /Option Buying/ }).count());
 await page.locator('#course-search-query').fill('zzzz-no-course');
 await page.getByText('No courses found for').waitFor();
 await page.keyboard.press('Escape');
 assert.equal(await dialog.count(), 0);
 await trigger.click();
 await page.locator('#course-search-query').fill('renko');
 await page.getByRole('button', { name: 'View search results' }).click();
 await page.waitForURL('**/courses?search=renko', { timeout: 90000 });
 await page.getByRole('button', { name: 'Search courses', exact: true }).click();
 await page.locator('#course-search-query').fill('');
 await page.setViewportSize({ width: 390, height: 844 });
 await page.screenshot({ path: 'docs/verification/upsurge-profile-search/search-mobile.png' });
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile overflow');
 await page.getByRole('link', { name: 'Stock Market Investing', exact: true }).last().click();
 await page.waitForURL('**/courses?category=Stock%20Market%20Investing');
 await page.goto('http://localhost:3000/en/user/profile/edit', { waitUntil: 'domcontentloaded', timeout: 120000 });
 await page.waitForURL('**/auth/login?next=**', { timeout: 60000 });
 console.log(JSON.stringify({ search: 'passed', autofocus: 'passed', keyboard: 'passed', categoryNavigation: 'passed', mobile: 'passed', profileAuthRedirect: 'passed', pageErrors: errors }));
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
