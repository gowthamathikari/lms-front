const { chromium } = require('playwright');
const { createServerClient } = require('@supabase/ssr');
const { loadEnvConfig } = require('@next/env');
const assert = require('node:assert/strict');
(async () => {
 loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
 const cookies = new Map();
 const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY, { cookies: { getAll: () => [...cookies.values()], setAll: values => values.forEach(value => cookies.set(value.name, value)) } });
 const { data, error } = await client.auth.signInWithPassword({ email: 'student@e2etest.com', password: 'password123' });
 if (error) { console.log('TEST_ACCOUNT_UNAVAILABLE: ' + error.message); return; }
 const { data: profile, error: readError } = await client.from('profiles').select('full_name, avatar_url').eq('id', data.user.id).single();
 assert.equal(readError, null, 'RLS profile read');
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 try {
 const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
 await context.addCookies([...cookies.values()].map(cookie => ({ name: cookie.name, value: cookie.value, domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax' })));
 const page = await context.newPage();
 await page.goto('http://localhost:3000/en/user/profile/edit', { waitUntil: 'domcontentloaded', timeout: 120000 });
 await page.locator('#profile-name').waitFor({ timeout: 60000 });
 assert.equal(await page.locator('#profile-name').inputValue(), profile.full_name ?? '');
 await page.screenshot({ path: 'docs/verification/upsurge-profile-search/profile-desktop.png' });
 await page.locator('#profile-name').fill('');
 await page.getByRole('button', { name: 'Save Changes' }).click();
 assert.equal(await page.locator('#profile-name').evaluate(el => el.validity.valueMissing), true);
 await page.locator('#profile-name').fill(profile.full_name ?? '');
 await page.setViewportSize({ width: 390, height: 844 });
 await page.screenshot({ path: 'docs/verification/upsurge-profile-search/profile-mobile.png', fullPage: true });
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'profile mobile overflow');
 await page.getByRole('button', { name: 'Open account menu' }).click();
 assert.match(await page.getByRole('menuitem', { name: 'My Profile' }).getAttribute('href'), /user\/profile\/edit$/);
 console.log('PASS: authenticated profile, RLS read, required-name validation, account link, desktop/mobile screenshots');
 } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exit(1); });
