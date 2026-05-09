import { test, expect } from '@playwright/test';

test('admin can log in and navigate every primary page without 404', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@vms.local');
  await page.getByLabel(/password/i).fill('admin123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  for (const link of ['Volunteers', 'Events', 'Shifts', 'Attendance', 'Reports', 'Messages', 'Settings']) {
    await page.getByRole('link', { name: link }).first().click();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText(/404|not found/i)).toHaveCount(0);
  }
});

test('public registration page submits', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel(/first name/i).fill('Smoke');
  await page.getByLabel(/last name/i).fill('Test');
  await page.getByLabel(/^email$/i).fill(`smoke${Date.now()}@example.com`);
  await page.getByLabel(/I agree/i).check();
  await page.getByRole('button', { name: /submit application/i }).click();
  await expect(page.getByText(/Application submitted/i)).toBeVisible();
});
