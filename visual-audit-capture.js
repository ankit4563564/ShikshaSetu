const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  // Create audit directory
  const auditDir = './visual-audit';
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Wait for page to load
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Let animations settle

  const viewports = [
    // Desktop
    { name: 'desktop-1440', width: 1440, height: 900, fullPage: true },
    { name: 'desktop-1440-hero', width: 1440, height: 900, fullPage: false },
    { name: 'desktop-1280', width: 1280, height: 800, fullPage: true },
    
    // Tablet
    { name: 'tablet-1024', width: 1024, height: 768, fullPage: true },
    { name: 'tablet-768', width: 768, height: 1024, fullPage: true },
    
    // Mobile
    { name: 'mobile-390-full', width: 390, height: 844, fullPage: true },
    { name: 'mobile-375-full', width: 375, height: 812, fullPage: true },
  ];

  for (const viewport of viewports) {
    console.log(`Capturing ${viewport.name}...`);
    
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    const filename = `${auditDir}/${viewport.name}.png`;
    
    if (viewport.fullPage) {
      // Full page screenshot
      await page.screenshot({
        path: filename,
        fullPage: true,
      });
    } else {
      // Viewport-only screenshot
      await page.screenshot({
        path: filename,
        fullPage: false,
      });
    }
    
    console.log(`✓ Saved ${filename}`);
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
  console.log(`Screenshots saved in: ${path.resolve(auditDir)}`);
})();
