import { KeywordContext } from './context';
import { budgetCalculatorData } from '../testData/en';
import { BudgetCalculatorPage } from '../components/pages/budgetCalculator.page';

const ensureBudgetPage = (context: KeywordContext): BudgetCalculatorPage => {
  if (!context.budgetCalculatorPage) {
    context.budgetCalculatorPage = new BudgetCalculatorPage(context.page);
  }
  return context.budgetCalculatorPage;
};

export const openBudgetCalculatorDirectly = async (
  context: KeywordContext,
): Promise<void> => {
  const budgetPage = ensureBudgetPage(context);
  await budgetPage.open();
};

export const populateBudgetCalculator = async (
  context: KeywordContext,
  income = budgetCalculatorData.incomeValue,
  zipcode = budgetCalculatorData.zipcodeValue,
): Promise<void> => {
  const budgetPage = ensureBudgetPage(context);
  await budgetPage.form.enterIncome(income);
  await budgetPage.form.enterZipcode(zipcode);
};

export const submitBudgetCalculator = async (context: KeywordContext): Promise<void> => {
  const budgetPage = ensureBudgetPage(context);
  await budgetPage.form.submit();
};

export const expectBudgetResults = async (context: KeywordContext): Promise<void> => {
  const budgetPage = ensureBudgetPage(context);
  await budgetPage.results.expectVisible();
};

export const triggerEmptyFormValidation = async (context: KeywordContext): Promise<void> => {
  const budgetPage = ensureBudgetPage(context);
  await budgetPage.form.submit();
  await budgetPage.form.assertValidationMessages();
};

export const triggerInvalidZipValidation = async (context: KeywordContext): Promise<void> => {
  const budgetPage = ensureBudgetPage(context);
  await budgetPage.form.enterIncome(budgetCalculatorData.incomeValue);
  await budgetPage.form.enterZipcode(budgetCalculatorData.invalidZipcode);
  await budgetPage.form.submit();
  await budgetPage.form.assertZipValidationMessage();
};
