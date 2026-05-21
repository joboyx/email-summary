import { describe, expect, test } from '@jest/globals';
import { gas, runInFreshSandbox } from './support/load-source';

describe('parseSummaryLine', () => {
  test('extracts value after prefix including colon', () => {
    const lines = [
      'category: personal',
      'summary: 👥 Reply from friend',
      'actionItem: None',
    ];

    expect(gas().parseSummaryLine(lines, 'category:')).toBe('personal');
    expect(gas().parseSummaryLine(lines, 'summary:')).toBe('👥 Reply from friend');
    expect(gas().parseSummaryLine(lines, 'actionItem:')).toBe('None');
  });

  test('throws when prefix line is missing', () => {
    expect(() => gas().parseSummaryLine(['summary: ok'], 'category:')).toThrow(
      'OpenRouter response missing line starting with "category:"',
    );
  });
});

describe('fetchOpenRouterChatCompletion', () => {
  test('returns parsed JSON for successful responses', () => {
    globalThis.gasTestMocks.urlFetchResponses.push({
      status: 200,
      body: JSON.stringify({
        choices: [{ message: { content: 'category: jobs\nsummary: 💼 Role\nactionItem: None' } }],
      }),
    });

    const response = gas().fetchOpenRouterChatCompletion({
      model: 'test-model',
      messages: [{ role: 'user', content: 'hello' }],
      max_completion_tokens: 100,
    });

    expect(response.choices?.[0]?.message?.content).toContain('category: jobs');
    expect(globalThis.gasTestMocks.urlFetchCalls).toHaveLength(1);
  });

  test('retries HTTP 429 and eventually succeeds', () => {
    globalThis.gasTestMocks.urlFetchResponses.push(
      { status: 429, body: 'rate limited' },
      {
        status: 200,
        body: JSON.stringify({
          choices: [{ message: { content: 'category: jobs\nsummary: 💼 Role\nactionItem: None' } }],
        }),
      },
    );

    const response = gas().fetchOpenRouterChatCompletion({
      model: 'test-model',
      messages: [{ role: 'user', content: 'hello' }],
      max_completion_tokens: 100,
    });

    expect(response.choices?.[0]?.message?.content).toContain('summary:');
    expect(globalThis.gasTestMocks.urlFetchCalls).toHaveLength(2);
    expect(globalThis.gasTestMocks.sleepCalls).toEqual([2000]);
  });

  test('throws when OpenRouter returns an error payload', () => {
    globalThis.gasTestMocks.urlFetchResponses.push({
      status: 400,
      body: JSON.stringify({ error: { code: 400, message: 'bad request' } }),
    });

    expect(() =>
      gas().fetchOpenRouterChatCompletion({
        model: 'test-model',
        messages: [{ role: 'user', content: 'hello' }],
        max_completion_tokens: 100,
      }),
    ).toThrow('OpenRouter error 400: bad request');
  });
});

describe('summarizeEmails', () => {
  test('parses OpenRouter lines and sorts by category then date', () => {
    globalThis.gasTestMocks.urlFetchResponses.push(
      {
        status: 200,
        body: JSON.stringify({
          choices: [
            {
              message: {
                content:
                  'category: jobs\nsummary: 💼 Interview invite\nactionItem: Reply by Friday',
              },
            },
          ],
        }),
      },
      {
        status: 200,
        body: JSON.stringify({
          choices: [
            {
              message: {
                content: 'category: personal\nsummary: 👥 Family update\nactionItem: None',
              },
            },
          ],
        }),
      },
    );

    const summaries = gas().summarizeEmails([
      {
        threadId: 't1',
        messageId: 'm1',
        messageDate: '2026-05-20T10:00:00.000Z',
        from: 'jobs@example.com',
        subject: 'Interview',
        content: 'Please reply',
        link: 'https://mail.example/t1',
      },
      {
        threadId: 't2',
        messageId: 'm2',
        messageDate: '2026-05-20T12:00:00.000Z',
        from: 'family@example.com',
        subject: 'Update',
        content: 'All good',
        link: 'https://mail.example/t2',
      },
    ]);

    expect(summaries).toHaveLength(2);
    expect(summaries[0].category).toBe('jobs');
    expect(summaries[1].category).toBe('personal');
    expect(summaries[0].actionItem).toBe('Reply by Friday');
  });

  test('warns and replaces summary when emoji is invalid', () => {
    globalThis.gasTestMocks.urlFetchResponses.push({
      status: 200,
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: 'category: jobs\nsummary: ??? Bad emoji\nactionItem: None',
            },
          },
        ],
      }),
    });

    const summaries = gas().summarizeEmails([
      {
        threadId: 't1',
        messageId: 'm1',
        messageDate: '2026-05-20T10:00:00.000Z',
        from: 'jobs@example.com',
        subject: 'Interview',
        content: 'Please reply',
        link: 'https://mail.example/t1',
      },
    ]);

    expect(summaries[0].summary).toBe('⚠️ Invalid emoji detected. Please review.');
    expect(globalThis.gasTestMocks.consoleWarnings.join('\n')).toContain('Invalid emoji detected');
  });

  test('throws when API key is missing', () => {
    runInFreshSandbox(
      (mocks) => {
        mocks.scriptProperties.OPENROUTER_API_KEY = null;
      },
      (api) => {
        expect(() => api.summarizeEmails([])).toThrow(
          'OPENROUTER_API_KEY script property is not set',
        );
      },
    );
  });
});
