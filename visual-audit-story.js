const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const auditDir = './visual-audit';
  if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

  const browser = await chromium.launch();

  // ===== DESKTOP =====
  const desktop = await browser.newPage();
  await desktop.setViewportSize({ width: 1440, height: 900 });
  await desktop.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await desktop.waitForTimeout(3000);

  const storyEl = await desktop.locator('#story').first();
  await storyEl.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(600);

  await storyEl.screenshot({ path: `${auditDir}/connected-story-before-desktop.png` });
  console.log('✓ connected-story-before-desktop.png');

  // Also capture bounding box for diagnosis
  const box = await storyEl.boundingBox();
  console.log('Desktop #story bounding box:', JSON.stringify(box));

  // Check computed styles of inner elements
  const innerSpace = await desktop.evaluate(() => {
    const el = document.querySelector('#story');
    if (!el) return null;
    const computed = window.getComputedStyle(el);
    const children = Array.from(el.children).map(c => ({
      tag: c.tagName,
      classes: c.className.substring(0, 100),
      height: c.getBoundingClientRect().height,
      offsetTop: c.offsetTop,
    }));
    return {
      height: el.getBoundingClientRect().height,
      paddingTop: computed.paddingTop,
      paddingBottom: computed.paddingBottom,
      minHeight: computed.minHeight,
      children,
    };
  });
  console.log('\nDesktop #story computed info:');
  console.log(JSON.stringify(innerSpace, null, 2));

  await desktop.close();

  // ===== MOBILE =====
  const mobile = await browser.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await mobile.waitForTimeout(3000);

  const storyMobile = await mobile.locator('#story').first();
  await storyMobile.scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(600);

  await storyMobile.screenshot({ path: `${auditDir}/connected-story-before-mobile.png` });
  console.log('✓ connected-story-before-mobile.png');

  const mobileBox = await storyMobile.boundingBox();
  console.log('\nMobile #story bounding box:', JSON.stringify(mobileBox));

  // Check the timeline container and last card
  const mobileInfo = await mobile.evaluate(() => {
    const el = document.querySelector('#story');
    if (!el) return null;
    const computed = window.getComputedStyle(el);

    // Find timeline wrapper
    const timelineWrapper = el.querySelector('.space-y-4, .space-y-5');
    const timelineCards = el.querySelectorAll('.rounded-2xl');
    const lastCard = timelineCards[timelineCards.length - 1];
    const lastCardRect = lastCard ? lastCard.getBoundingClientRect() : null;
    const sectionRect = el.getBoundingClientRect();

    return {
      sectionHeight: sectionRect.height,
      paddingBottom: computed.paddingBottom,
      minHeight: computed.minHeight,
      lastCardBottom: lastCardRect ? (lastCardRect.bottom - sectionRect.top) : null,
      emptySpaceAfterLastCard: lastCardRect ? (sectionRect.height - (lastCardRect.bottom - sectionRect.top)) : null,
    };
  });
  console.log('\nMobile section analysis:');
  console.log(JSON.stringify(mobileInfo, null, 2));

  await mobile.close();
  await browser.close();
  console.log('\nDone. Check before screenshots and layout data above.');
})();
