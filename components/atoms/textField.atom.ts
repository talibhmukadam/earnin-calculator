import type { Locator, Page } from '@playwright/test';

export class TextFieldAtom {
  constructor(private readonly page: Page) {}

  byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
