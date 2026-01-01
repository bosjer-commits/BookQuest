// Mobile Browser Launcher using Playwright
const { chromium, devices } = require('playwright');

async function launchMobileBrowser() {
    console.log('📱 Launching mobile browser...\n');

    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security']
    });

    // Emulate iPhone 14 Pro (similar to your mockups)
    const context = await browser.newContext({
        ...devices['iPhone 14 Pro'],
        locale: 'en-US',
    });

    const page = await context.newPage();

    // Navigate to the Next.js dev server
    console.log('🌐 Opening http://localhost:3000\n');
    await page.goto('http://localhost:3000');

    console.log('✅ Mobile browser ready!\n');
    console.log('Press Ctrl+C to exit.\n');

    // Keep running
    await new Promise(() => {});
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n👋 Closing browser...\n');
    process.exit(0);
});

// Start
launchMobileBrowser().catch(console.error);
