const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const auditDir = './visual-audit';
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  // ===== DESKTOP AUDIT 1440x900 =====
  console.log('\n=== DESKTOP 1440x900 AUDIT ===\n');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1440, height: 900 });
  await desktopPage.goto('http://localhost:3000', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });
  await desktopPage.waitForTimeout(3000);

  // Desktop section selectors - capture each major section
  const desktopSections = [
    { name: '01-navbar-hero', selector: 'section.hero-gradient' },
    { name: '02-dual-experience', selector: '#dual-experience' },
    { name: '03-connected-story', selector: '#story' },
    { name: '04-schoolgpt', selector: '#schoolgpt' },
    { name: '05-transit-map', selector: '#parents' },
    { name: '06-admin-operations', scrollTo: 6 }, // Scroll-based
    { name: '07-testimonials', selector: '#testimonials' },
    { name: '08-final-cta-footer', scrollTo: 8 },
  ];

  for (const section of desktopSections) {
    try {
      console.log(`Capturing desktop: ${section.name}...`);
      
      if (section.selector) {
        const element = await desktopPage.locator(section.selector).first();
        await element.scrollIntoViewIfNeeded();
        await desktopPage.waitForTimeout(500);
        
        await element.screenshot({
          path: `${auditDir}/desktop-${section.name}.png`,
        });
      } else if (section.scrollTo !== undefined) {
        // Scroll-based capture for sections without clear IDs
        const scrollMultiplier = section.scrollTo * 900;
        await desktopPage.evaluate((y) => window.scrollTo(0, y), scrollMultiplier);
        await desktopPage.waitForTimeout(500);
        
        await desktopPage.screenshot({
          path: `${auditDir}/desktop-${section.name}.png`,
        });
      }
      
      console.log(`✓ Saved desktop-${section.name}.png`);
    } catch (e) {
      console.log(`⚠ Could not capture ${section.name}: ${e.message}`);
    }
  }

  await desktopPage.close();

  // ===== MOBILE AUDIT 390x844 =====
  console.log('\n=== MOBILE 390x844 AUDIT ===\n');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 390, height: 844 });
  await mobilePage.goto('http://localhost:3000', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });
  await mobilePage.waitForTimeout(3000);

  const mobileSections = [
    { name: '01-navbar-hero', selector: 'section.hero-gradient' },
    { name: '02-dual-experience', selector: '#dual-experience' },
    { name: '03-connected-story', selector: '#story' },
    { name: '04-schoolgpt', selector: '#schoolgpt' },
    { name: '05-transit-map', selector: '#parents' },
    { name: '06-admin-operations', scrollTo: 5 },
    { name: '07-testimonials', selector: '#testimonials' },
    { name: '08-final-cta-footer', scrollTo: 7 },
  ];

  for (const section of mobileSections) {
    try {
      console.log(`Capturing mobile: ${section.name}...`);
      
      if (section.selector) {
        const element = await mobilePage.locator(section.selector).first();
        await element.scrollIntoViewIfNeeded();
        await mobilePage.waitForTimeout(500);
        
        await element.screenshot({
          path: `${auditDir}/mobile-${section.name}.png`,
        });
      } else if (section.scrollTo !== undefined) {
        const scrollMultiplier = section.scrollTo * 844;
        await mobilePage.evaluate((y) => window.scrollTo(0, y), scrollMultiplier);
        await mobilePage.waitForTimeout(500);
        
        await mobilePage.screenshot({
          path: `${auditDir}/mobile-${section.name}.png`,
        });
      }
      
      console.log(`✓ Saved mobile-${section.name}.png`);
    } catch (e) {
      console.log(`⚠ Could not capture ${section.name}: ${e.message}`);
    }
  }

  await mobilePage.close();
  await browser.close();
  
  console.log('\n=== SECTION-BY-SECTION SCREENSHOTS COMPLETE ===');
  console.log(`All screenshots saved in: ${auditDir}/`);
})();
