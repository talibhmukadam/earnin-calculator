import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import { trackSegmentEvents, type SegmentEvent } from './utils/segmentTracker';
import { KeywordContext } from '../keywords/context';
import {
  goToBudgetCalculator,
  openFinancialCalculatorsList,
  openFinancialCalculatorsWithoutConsent,
  verifyFinancialCalculatorsListVisible,
} from '../keywords/financialCalculators.keywords';
import {
  expectBudgetResults,
  openBudgetCalculatorDirectly,
  populateBudgetCalculator,
  submitBudgetCalculator,
  triggerEmptyFormValidation,
  triggerInvalidZipValidation,
} from '../keywords/budgetCalculator.keywords';
import { analyticsEvents, analyticsProperties } from '../constants/analytics';
import { budgetCalculatorData } from '../testData/en';
import { testIds } from '../components/atoms/selectors';

const ajv = new Ajv({ allErrors: true, strict: false });

const segmentEventSchema = {
  type: 'object',
  required: ['event', 'properties'],
  properties: {
    type: { type: 'string' },
    event: { type: 'string' },
    properties: {
      type: 'object',
      required: ['screenName'],
      properties: {
        screenName: { type: 'string' },
        elementName: { type: ['string', 'null'] },
        component: { type: ['string', 'null'] },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
} as const;

const validateSegmentEvent = ajv.compile(segmentEventSchema);

const screenNameMatches = (value?: string | null): boolean =>
  analyticsProperties.screenNameBudgetOptions.some(
    (expected) => expected.toLowerCase() === (value ?? '').toLowerCase(),
  );

const waitForEvent = async (
  events: SegmentEvent[],
  predicate: (event: SegmentEvent) => boolean,
  message: string,
) => {
  let matched: SegmentEvent | undefined;
  await expect
    .poll(() => {
      matched = events.find(predicate);
      return Boolean(matched);
    }, { message })
    .toBeTruthy();
  return matched!;
};

const countEvents = (
  events: SegmentEvent[],
  predicate: (event: SegmentEvent) => boolean,
): number => events.filter(predicate).length;

test('financial calculators page displays calculator cards', async ({ page }) => {
  const context = new KeywordContext(page);
  await openFinancialCalculatorsList(context);
  await verifyFinancialCalculatorsListVisible(context);
});

test.describe('Budget calculator analytics', () => {
  test('tracks required analytics events after consent', async ({ page }) => {
    const context = new KeywordContext(page);
    const tracker = trackSegmentEvents(page);

    try {
      await openFinancialCalculatorsList(context);
      await verifyFinancialCalculatorsListVisible(context);
      await goToBudgetCalculator(context);
      await populateBudgetCalculator(context);
      await submitBudgetCalculator(context);
      await expectBudgetResults(context);

      const pageView = await waitForEvent(
        tracker.events,
        (event) =>
          event.event === analyticsEvents.pageView &&
          screenNameMatches(event.properties?.screenName),
        'Expected budget calculator page view event',
      );
      expect(validateSegmentEvent(pageView)).toBeTruthy();

      const incomeEvent = await waitForEvent(
        tracker.events,
        (event) =>
          event.event === analyticsEvents.elementInteraction &&
          event.properties?.elementName === analyticsProperties.elementIncome,
        'Expected income interaction event',
      );
      expect(incomeEvent.properties?.component).toBe(analyticsProperties.componentInputField);
      expect(validateSegmentEvent(incomeEvent)).toBeTruthy();

      const zipcodeEvent = await waitForEvent(
        tracker.events,
        (event) =>
          event.event === analyticsEvents.elementInteraction &&
          event.properties?.elementName === analyticsProperties.elementZipcode,
        'Expected zipcode interaction event',
      );
      expect(zipcodeEvent.properties?.component).toBe(analyticsProperties.componentInputField);
      expect(validateSegmentEvent(zipcodeEvent)).toBeTruthy();

      const calculateEvent = await waitForEvent(
        tracker.events,
        (event) =>
          event.event === analyticsEvents.elementInteraction &&
          event.properties?.elementName === analyticsProperties.elementCalculate,
        'Expected calculate CTA event',
      );
      expect(calculateEvent.properties?.component).toBe(analyticsProperties.componentCta);
      expect(validateSegmentEvent(calculateEvent)).toBeTruthy();

      const expectations = [
        {
          label: 'Page view',
          min: 1,
          max: 2,
          count: countEvents(
            tracker.events,
            (event) =>
              event.event === analyticsEvents.pageView &&
              screenNameMatches(event.properties?.screenName),
          ),
        },
        {
          label: 'Income interaction',
          min: 1,
          max: 1,
          count: countEvents(
            tracker.events,
            (event) =>
              event.event === analyticsEvents.elementInteraction &&
              event.properties?.elementName === analyticsProperties.elementIncome,
          ),
        },
        {
          label: 'Zip interaction',
          min: 1,
          max: 1,
          count: countEvents(
            tracker.events,
            (event) =>
              event.event === analyticsEvents.elementInteraction &&
              event.properties?.elementName === analyticsProperties.elementZipcode,
          ),
        },
        {
          label: 'Calculate CTA',
          min: 1,
          max: 1,
          count: countEvents(
            tracker.events,
            (event) =>
              event.event === analyticsEvents.elementInteraction &&
              event.properties?.elementName === analyticsProperties.elementCalculate,
          ),
        },
      ];

      const mismatches = expectations.filter(({ count, min, max }) =>
        count < min || (typeof max === 'number' && count > max),
      );

      expect(mismatches).toEqual([]);
    } finally {
      tracker.stop();
    }
  });

  test('does not emit analytics before consent is granted', async ({ page }) => {
    const tracker = trackSegmentEvents(page);

    try {
      const context = new KeywordContext(page);
      await openFinancialCalculatorsWithoutConsent(context);
      await expect(
        page.locator('#onetrust-consent-sdk, aside.dg-consent-banner'),
      ).toBeVisible();

      await page.evaluate(({ income, zip, calculate, incomeValue, zipValue }) => {
        (document.querySelector(`[data-testid="${income}"]`) as HTMLInputElement | null)?.setAttribute(
          'value',
          incomeValue,
        );
        (document.querySelector(`[data-testid="${zip}"]`) as HTMLInputElement | null)?.setAttribute(
          'value',
          zipValue,
        );
        (document.querySelector(`[data-testid="${calculate}"]`) as HTMLButtonElement | null)?.click();
      }, {
        income: testIds.incomeInput,
        zip: testIds.zipcodeInput,
        calculate: testIds.calculateButton,
        incomeValue: budgetCalculatorData.incomeValue,
        zipValue: budgetCalculatorData.zipcodeValue,
      });

      await page.waitForTimeout(4000);
      const interactionEvents = tracker.events.filter(
        (event) => event.event === analyticsEvents.elementInteraction,
      );
      expect(interactionEvents.length).toBe(0);
    } finally {
      tracker.stop();
    }
  });

  test.describe('Edge case analytics instrumentation', () => {
    test('submission without inputs logs validation errors but should not fire CTA analytics', async ({
      page,
    }) => {
      test.fail(
        true,
        'Known issue: calculate CTA analytics fires even when validation fails with empty form.',
      );

      const context = new KeywordContext(page);
      const tracker = trackSegmentEvents(page);

      try {
        await openBudgetCalculatorDirectly(context);
        await triggerEmptyFormValidation(context);

        const calculateEvents = tracker.events.filter(
          (event) =>
            event.event === analyticsEvents.elementInteraction &&
            event.properties?.elementName === analyticsProperties.elementCalculate,
        );
        expect(calculateEvents.length).toBe(0);

        const validationEvents = tracker.events.filter(
          (event) =>
            event.event === analyticsEvents.validationError &&
            [analyticsProperties.elementIncome, analyticsProperties.elementZipcode].includes(
              String(event.properties?.elementName),
            ),
        );
        expect(validationEvents.length).toBeGreaterThanOrEqual(2);
      } finally {
        tracker.stop();
      }
    });

    test('invalid ZIP submission logs validation errors but should not fire CTA analytics', async ({
      page,
    }) => {
      test.fail(
        true,
        'Known issue: calculate CTA analytics fires even when ZIP validation fails.',
      );

      const context = new KeywordContext(page);
      const tracker = trackSegmentEvents(page);

      try {
        await openBudgetCalculatorDirectly(context);
        await triggerInvalidZipValidation(context);

        const calculateEvents = tracker.events.filter(
          (event) =>
            event.event === analyticsEvents.elementInteraction &&
            event.properties?.elementName === analyticsProperties.elementCalculate,
        );
        expect(calculateEvents.length).toBe(0);

        const validationEvents = tracker.events.filter(
          (event) =>
            event.event === analyticsEvents.validationError &&
            String(event.properties?.elementName).includes(analyticsProperties.elementZipcode),
        );
        expect(validationEvents.length).toBeGreaterThanOrEqual(1);
      } finally {
        tracker.stop();
      }
    });
  });
});
