import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { t } from '../../i18n';

export class BudgetResultsOrganism {
  constructor(private readonly page: Page) {}

  async expectVisible(): Promise<void> {
    await expect(
      this.page.getByText(t('budgetResultsTitle'), { exact: false }),
    ).toBeVisible();
  }
}
