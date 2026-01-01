import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 }
});
const page = await context.newPage();

await page.goto('http://localhost:3000/library');
await page.waitForTimeout(3000);

// Find and click the info button
const infoButton = await page.locator('button[aria-label="Book information"]').first();
await infoButton.click();
await page.waitForTimeout(500);

// Take screenshot of modal
await page.screenshot({
  path: 'library-info-modal.png',
  fullPage: false
});

await browser.close();
console.log('Library info modal screenshot saved');
