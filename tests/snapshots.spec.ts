import { test as base, expect, devices, type Page } from '@playwright/test';
import { KeywordContext } from '../keywords/context';
import {
  openFinancialCalculatorsList,
  verifyFinancialCalculatorsListVisible,
  goToBudgetCalculator,
} from '../keywords/financialCalculators.keywords';
import { openBudgetCalculatorDirectly } from '../keywords/budgetCalculator.keywords';

const prepareFinancialCalculatorsList = async (context: KeywordContext) => {
  await openFinancialCalculatorsList(context);
  await verifyFinancialCalculatorsListVisible(context);
};

const prepareBudgetCalculatorPage = async (context: KeywordContext) => {
  await openBudgetCalculatorDirectly(context);
  await context.page.waitForTimeout(1000);
};

const ensureVisualStability = async (page: Page): Promise<void> => {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(200);
};

const { defaultBrowserType: _desktopDefault, ...desktopDevice } = devices['Desktop Chrome'];
const desktopTest = base.extend({});
desktopTest.use({ ...desktopDevice });

desktopTest.describe('Snapshots – Chrome Desktop', () => {
  desktopTest('S1 – Financial calculators list', async ({ page }) => {
    const context = new KeywordContext(page);
    await prepareFinancialCalculatorsList(context);
    await ensureVisualStability(page);
    await expect(page).toHaveScreenshot('financial-calculators-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });

  desktopTest('S3 – Budget calculator page', async ({ page }) => {
    const context = new KeywordContext(page);
    await prepareBudgetCalculatorPage(context);
    await ensureVisualStability(page);
    await expect(page).toHaveScreenshot('budget-calculator-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.08,
    });
  });
});

const { defaultBrowserType: _mobileDefault, ...mobileDevice } = devices['iPhone 14 Pro'];
const safariMobileTest = base.extend({});
safariMobileTest.use({ ...mobileDevice, browserName: 'webkit' });

safariMobileTest.describe('Snapshots – Safari Mobile', () => {
  safariMobileTest('S2 – Financial calculators list', async ({ page }) => {
    const context = new KeywordContext(page);
    await prepareFinancialCalculatorsList(context);
    await ensureVisualStability(page);
    await expect(page).toHaveScreenshot('financial-calculators-safari-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });

  safariMobileTest('S4 – Budget calculator page', async ({ page }) => {
    const context = new KeywordContext(page);
    await prepareBudgetCalculatorPage(context);
    await ensureVisualStability(page);
    await expect(page).toHaveScreenshot('budget-calculator-safari-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.08,
    });
  });
});
