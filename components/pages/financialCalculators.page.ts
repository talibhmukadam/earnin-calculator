import { BasePage } from '../base/base.page';
import { FinancialCalculatorsTemplate } from '../templates/financialCalculators.template';
import { ConsentMolecule } from '../molecules/consent.molecule';
import { routes, testIds } from '../atoms/selectors';
import { BudgetCalculatorPage } from './budgetCalculator.page';
import { t } from '../../i18n';

export class FinancialCalculatorsPage extends BasePage {
  private readonly template = new FinancialCalculatorsTemplate(this.page);
  private readonly consent = new ConsentMolecule(this.page);

  async open(): Promise<void> {
    await this.page.goto(routes.financialCalculators, { waitUntil: 'domcontentloaded' });
    await this.consent.acceptAll();
  }

  async openWithoutConsent(): Promise<void> {
    await this.page.goto(routes.financialCalculators, { waitUntil: 'domcontentloaded' });
  }

  async expectLoaded(): Promise<void> {
    await this.template.expectVisible();
  }

  async navigateToBudgetCalculator(): Promise<BudgetCalculatorPage> {
    const destination = await this.page
      .getByRole('link', { name: t('budgetCalculatorLinkText') })
      .getAttribute('href');

    if (!destination) {
      throw new Error('Budget calculator link not found');
    }

    await this.page.goto(destination, { waitUntil: 'domcontentloaded' });
    await this.consent.acceptAll();
    await this.page.waitForSelector(`[data-testid="${testIds.incomeInput}"]`);
    return new BudgetCalculatorPage(this.page);
  }
}
