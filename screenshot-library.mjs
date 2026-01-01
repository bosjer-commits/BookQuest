import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 }
});
const page = await context.newPage();

await page.goto('http://localhost:3000/library');
await page.waitForTimeout(3000);

await page.screenshot({
  path: 'library-screenshot.png',
  fullPage: false
});

await browser.close();
console.log('Library screenshot saved');
