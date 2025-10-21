import type { Locator, Page } from '@playwright/test';

export class TextAtom {
  constructor(private readonly page: Page) {}

  byExactText(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }

  byRoleLink(name: string): Locator {
    return this.page.getByRole('link', { name });
  }
}
