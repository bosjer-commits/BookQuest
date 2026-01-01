import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 }
});
const page = await context.newPage();

await page.goto('http://localhost:3000');
await page.waitForTimeout(3000);

// Find the info button
const infoButton = await page.locator('button[aria-label="Book information"]').first();
const isVisible = await infoButton.isVisible();

console.log('Info button visible:', isVisible);

if (isVisible) {
  // Click it
  await infoButton.click();
  await page.waitForTimeout(500);

  // Check if modal appeared
  const modal = await page.locator('text=Author:').isVisible();
  console.log('Modal appeared:', modal);

  await page.screenshot({ path: 'info-modal-test.png' });
}

await browser.close();
