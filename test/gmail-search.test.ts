import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { createMockThread } from './support/gas-mocks';
import { gas } from './support/load-source';

describe('getSearchStringForLastNDays', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-21T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('builds a Gmail after: query for n days ago', () => {
    expect(gas().getSearchStringForLastNDays(1)).toBe('after:2026/05/20');
    expect(gas().getSearchStringForLastNDays(7)).toBe('after:2026/05/14');
  });
});

describe('getPreviousDayEmails', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-21T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('normalizes recent inbox messages into EmailInput records', () => {
    createMockThread(globalThis.gasTestMocks, {
      id: 'thread-1',
      permalink: 'https://mail.example/thread-1',
      messages: [
        {
          id: 'message-1',
          date: new Date('2026-05-20T15:00:00.000Z'),
          from: 'sender@example.com',
          subject: 'Hello',
          plainBody: 'Plain body',
        },
      ],
    });

    const emails = gas().getPreviousDayEmails();

    expect(emails).toEqual([
      {
        threadId: 'thread-1',
        messageId: 'message-1',
        messageDate: '2026-05-20T15:00:00.000Z',
        from: 'sender@example.com',
        subject: 'Hello',
        content: 'Plain body',
        link: 'https://mail.example/thread-1',
      },
    ]);
  });

  test('filters out messages older than the search window', () => {
    createMockThread(globalThis.gasTestMocks, {
      id: 'thread-1',
      messages: [
        {
          id: 'old-message',
          date: new Date('2026-05-18T15:00:00.000Z'),
          subject: 'Old',
        },
        {
          id: 'recent-message',
          date: new Date('2026-05-20T15:00:00.000Z'),
          subject: 'Recent',
        },
      ],
    });

    const emails = gas().getPreviousDayEmails();

    expect(emails.map((email) => email.messageId)).toEqual(['recent-message']);
  });
});
