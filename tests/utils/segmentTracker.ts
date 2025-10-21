import type { Page, Request } from '@playwright/test';

export type SegmentEvent = {
  event?: string;
  type?: string;
  properties?: {
    screenName?: string;
    elementName?: string | null;
    component?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type SegmentTracker = {
  events: SegmentEvent[];
  stop: () => void;
};

const SEGMENT_ENDPOINT_REGEX = /\/t\b/;

export const trackSegmentEvents = (page: Page): SegmentTracker => {
  const events: SegmentEvent[] = [];

  const handler = (request: Request) => {
    if (request.method() !== 'POST') {
      return;
    }

    const url = request.url();
    if (!SEGMENT_ENDPOINT_REGEX.test(url)) {
      return;
    }

    const body = request.postData();
    if (!body) {
      return;
    }

    try {
      const parsed = JSON.parse(body);

      if (Array.isArray(parsed.batch)) {
        for (const item of parsed.batch) {
          events.push(item as SegmentEvent);
        }
      } else {
        events.push(parsed as SegmentEvent);
      }
    } catch (error) {
      console.warn('Failed to parse Segment payload', { url, error });
    }
  };

  page.on('request', handler);

  return {
    events,
    stop: () => page.off('request', handler),
  };
};
