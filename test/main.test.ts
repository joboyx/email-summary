import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { createMockThread } from './support/gas-mocks';
import { gas, runInFreshSandbox } from './support/load-source';

describe('summarizeAndSendDailyEmail', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-21T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('runs the full pipeline and returns success', () => {
    createMockThread(globalThis.gasTestMocks, {
      id: 'thread-1',
      messages: [
        {
          id: 'message-1',
          date: new Date('2026-05-20T15:00:00.000Z'),
          subject: 'Interview',
          plainBody: 'Please confirm',
        },
      ],
    });

    globalThis.gasTestMocks.urlFetchResponses.push({
      status: 200,
      body: JSON.stringify({
        choices: [
          {
            message: {
              content:
                'category: jobs\nsummary: 💼 Interview confirmation\nactionItem: Reply today',
            },
          },
        ],
      }),
    });

    const result = gas().summarizeAndSendDailyEmail();

    expect(result).toEqual({
      success: true,
      message: 'Email summary processed successfully',
    });
    expect(globalThis.gasTestMocks.sentEmails).toHaveLength(1);
    expect(globalThis.gasTestMocks.archivedThreadIds).toEqual(['thread-1']);
    expect(globalThis.gasTestMocks.labelAssignments).toEqual([
      { threadId: 'thread-1', labelName: '🤖 EmailSummary/⚠️ ActionRequired' },
    ]);
  });

  test('returns failure when OpenRouter key is missing', () => {
    const result = runInFreshSandbox(
      (mocks) => {
        mocks.scriptProperties.OPENROUTER_API_KEY = null;
      },
      (api) => api.summarizeAndSendDailyEmail(),
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('OPENROUTER_API_KEY script property is not set');
  });
});
