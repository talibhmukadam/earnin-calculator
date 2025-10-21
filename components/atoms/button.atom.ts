import type { Locator, Page } from '@playwright/test';

export class ButtonAtom {
  constructor(private readonly page: Page) {}

  byRoleName(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
