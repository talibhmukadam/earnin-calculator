import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ButtonAtom } from '../atoms/button.atom';
import { t } from '../../i18n';

export class ConsentMolecule {
  private readonly buttons: ButtonAtom;

  constructor(private readonly page: Page) {
    this.buttons = new ButtonAtom(page);
  }

  async acceptAll(): Promise<void> {
    const agreeButton = this.buttons.byRoleName(t('consentAgreeCta'));
    if (await agreeButton.isVisible()) {
      await agreeButton.click();
    }
    const bannerOverlay = this.page.locator('#onetrust-consent-sdk, aside.dg-consent-banner');
    if (await bannerOverlay.count()) {
      await expect(bannerOverlay).toBeHidden({ timeout: 10_000 });
    }
  }
}
