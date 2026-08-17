import { test, expect } from '@playwright/test';
import { createSignedSessionValue, COOKIE_NAME } from '../../lib/demo/session';

test.describe('Phase G1.2 — Gate & Dismissal Safety E2E Audit', () => {
  test('Gate Console loads and handles pass verification & emergency override UI', async ({ page }) => {
    test.setTimeout(90000);

    // Create valid signed demo session cookie for gate role
    const demoCookieVal = await createSignedSessionValue('gate');
    await page.context().addCookies([
      {
        name: COOKIE_NAME,
        value: demoCookieVal,
        domain: 'localhost',
        path: '/',
      },
    ]);

    // 1. Navigate to Gate Console
    await page.goto('/gate', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 2. Verify header rendering
    await expect(page.locator('text=Gate Console & Dismissal Safety')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Online-First Verification Active')).toBeVisible();

    // 3. Verify manual code input field exists
    const codeInput = page.locator('input[placeholder="e.g. 849201"]');
    await expect(codeInput).toBeVisible();

    // 4. Test emergency override drawer toggle
    const emergencyBtn = page.locator('button', { hasText: 'Emergency Override' });
    await expect(emergencyBtn).toBeVisible();
    await emergencyBtn.click();

    // 5. Verify emergency override drawer rendering
    await expect(page.locator('text=Emergency Student Pickup Override')).toBeVisible();
  });
});
