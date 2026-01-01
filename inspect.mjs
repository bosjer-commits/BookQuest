import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 }
});
const page = await context.newPage();

await page.goto('http://localhost:3000');
await page.waitForTimeout(3000);

// Check app-container computed styles
const appContainerStyles = await page.evaluate(() => {
  const container = document.querySelector('.app-container');
  const styles = window.getComputedStyle(container);
  return {
    margin: styles.margin,
    marginBottom: styles.marginBottom,
    padding: styles.padding,
    paddingBottom: styles.paddingBottom,
    height: styles.height,
    position: styles.position,
    bottom: styles.bottom
  };
});

console.log('=== APP CONTAINER STYLES ===');
console.log(appContainerStyles);

await browser.close();
