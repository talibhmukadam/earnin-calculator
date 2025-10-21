import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { TextAtom } from '../atoms/text.atom';
import { t } from '../../i18n';

export class FinancialCalculatorsTemplate {
  private readonly text: TextAtom;

  constructor(private readonly page: Page) {
    this.text = new TextAtom(page);
  }

  async expectVisible(): Promise<void> {
    await expect(this.text.byExactText(t('financialCalculatorsHeading'))).toBeVisible();
    await expect(this.text.byRoleLink(t('budgetCalculatorLinkText'))).toBeVisible();
    await expect(this.text.byRoleLink(t('rentCalculatorLinkText'))).toBeVisible();
  }
}
