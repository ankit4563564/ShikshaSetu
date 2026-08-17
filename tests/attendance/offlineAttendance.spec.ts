import { test, expect } from '@playwright/test';

test.describe('Phase G1.1 — Real Browser Offline Attendance E2E Audit', () => {
  test('Teacher can view attendance overview widget and open Take Attendance modal', async ({ page }) => {
    test.setTimeout(90000);

    // Navigate to teacher dashboard
    await page.goto('/teacher', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Verify page loads teacher workspace greeting
    await expect(page.locator('h1')).toContainText('Good morning', { timeout: 30000 });
    await expect(page.locator('text=Attendance Overview')).toBeVisible();

    // Verify "Take Attendance" action button is visible
    const takeAttendanceBtn = page.locator('button', { hasText: 'Take Attendance' });
    await expect(takeAttendanceBtn).toBeVisible();

    // Click Take Attendance to open modal
    await takeAttendanceBtn.click();

    // Verify modal title and roster display
    const modalHeading = page.getByRole('heading', { name: 'Daily Attendance Roll Call' });
    await expect(modalHeading).toBeVisible();
    await expect(page.locator('text=Mark All Present')).toBeVisible();
  });
});
