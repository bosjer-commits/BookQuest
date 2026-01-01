import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 }
});
const page = await context.newPage();

await page.goto('http://localhost:3000');
await page.waitForTimeout(2000); // Wait for content to load

await page.screenshot({
  path: 'auto-screenshot.png',
  fullPage: false
});

await browser.close();
console.log('Screenshot saved to auto-screenshot.png');
