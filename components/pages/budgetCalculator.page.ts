import { BasePage } from '../base/base.page';
import { ConsentMolecule } from '../molecules/consent.molecule';
import { BudgetCalculatorFormOrganism } from '../organisms/budgetCalculatorForm.organism';
import { BudgetResultsOrganism } from '../organisms/budgetResults.organism';
import { routes, testIds } from '../atoms/selectors';

export class BudgetCalculatorPage extends BasePage {
  private readonly consent = new ConsentMolecule(this.page);
  readonly form = new BudgetCalculatorFormOrganism(this.page);
  readonly results = new BudgetResultsOrganism(this.page);

  async open(): Promise<void> {
    await this.page.goto(routes.budgetCalculator);
    await this.consent.acceptAll();
    await this.page.waitForSelector(`[data-testid="${testIds.incomeInput}"]`);
  }
}
