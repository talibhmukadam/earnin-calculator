import type { Page } from '@playwright/test';
import type { FinancialCalculatorsPage } from '../components/pages/financialCalculators.page';
import type { BudgetCalculatorPage } from '../components/pages/budgetCalculator.page';

export class KeywordContext {
  financialCalculatorsPage?: FinancialCalculatorsPage;
  budgetCalculatorPage?: BudgetCalculatorPage;

  constructor(public readonly page: Page) {}
}
