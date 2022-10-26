import { test, expect } from '@playwright/test'

test('homepage has Playwright in title and get started link linking to the intro page', async ({ page }) => {
  await page.goto('http://127.0.0.1:8096/customer/alice')

  await expect(page).toHaveTitle(/UI/)

  await page.check("text='strawberry'")
  await page.check("text='banana'")
  await page.click("text='Save'")

  await page.click("text='Submit'")
});
