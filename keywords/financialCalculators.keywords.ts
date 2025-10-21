import { FinancialCalculatorsPage } from '../components/pages/financialCalculators.page';
import { KeywordContext } from './context';

export const openFinancialCalculatorsList = async (
  context: KeywordContext,
): Promise<void> => {
  const pageModel = new FinancialCalculatorsPage(context.page);
  await pageModel.open();
  context.financialCalculatorsPage = pageModel;
};

export const openFinancialCalculatorsWithoutConsent = async (
  context: KeywordContext,
): Promise<void> => {
  const pageModel = new FinancialCalculatorsPage(context.page);
  await pageModel.openWithoutConsent();
  context.financialCalculatorsPage = pageModel;
};

export const verifyFinancialCalculatorsListVisible = async (
  context: KeywordContext,
): Promise<void> => {
  await context.financialCalculatorsPage?.expectLoaded();
};

export const goToBudgetCalculator = async (context: KeywordContext): Promise<void> => {
  if (!context.financialCalculatorsPage) {
    throw new Error('Financial calculators page not initialized');
  }
  context.budgetCalculatorPage =
    await context.financialCalculatorsPage.navigateToBudgetCalculator();
};
