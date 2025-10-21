import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { TextFieldAtom } from '../atoms/textField.atom';
import { ButtonAtom } from '../atoms/button.atom';
import { testIds } from '../atoms/selectors';
import { t } from '../../i18n';

export class BudgetCalculatorFormOrganism {
  private readonly fields: TextFieldAtom;
  private readonly buttons: ButtonAtom;

  constructor(private readonly page: Page) {
    this.fields = new TextFieldAtom(page);
    this.buttons = new ButtonAtom(page);
  }

  async enterIncome(value: string): Promise<void> {
    await this.fields.byTestId(testIds.incomeInput).fill(value);
  }

  async enterZipcode(value: string): Promise<void> {
    await this.fields.byTestId(testIds.zipcodeInput).fill(value);
  }

  async submit(): Promise<void> {
    await this.buttons.byTestId(testIds.calculateButton).evaluate((button: HTMLButtonElement) =>
      button.click(),
    );
  }

  async assertValidationMessages(): Promise<void> {
    await expect(this.page.getByTestId(testIds.incomeError)).toContainText(
      t('incomeValidationMessage'),
    );
    await expect(this.page.getByTestId(testIds.zipcodeError)).toContainText(
      t('zipcodeValidationMessage'),
    );
  }

  async assertZipValidationMessage(): Promise<void> {
    await expect(this.page.getByTestId(testIds.zipcodeError)).toContainText(
      t('zipcodeValidationMessage'),
    );
  }
}
