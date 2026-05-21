import { describe, expect, test } from '@jest/globals';
import { createMockThread } from './support/gas-mocks';
import { gas } from './support/load-source';

const sampleSummary: EmailSummary = {
  threadId: 'thread-1',
  messageId: 'message-1',
  messageDate: '2026-05-20T10:00:00.000Z',
  from: 'sender@example.com',
  subject: 'Project update',
  content: 'Body',
  link: 'https://mail.example/thread-1',
  summary: '💼 Project update ready',
  category: 'jobs',
  actionItem: 'Review deck',
};

describe('formatSummariesAsHTML', () => {
  test('renders summary rows, action items, and category legend', () => {
    const html = gas().formatSummariesAsHTML([sampleSummary]);

    expect(html).toContain('Daily Email Summary');
    expect(html).toContain('💼 Project update ready');
    expect(html).toContain('<strong>Subject:</strong> Project update');
    expect(html).toContain('Review deck');
    expect(html).toContain('https://mail.example/thread-1');
    expect(html).toContain('marketing - Promotional content');
  });

  test('omits action item block when actionItem is None', () => {
    const html = gas().formatSummariesAsHTML([
      {
        ...sampleSummary,
        actionItem: 'None',
      },
    ]);

    expect(html).not.toContain('background: #fff3cd');
  });
});

describe('explainEmail', () => {
  test('includes thread, message, and category details', () => {
    expect(gas().explainEmail(sampleSummary)).toBe(
      'threadId[thread-1] messageId[message-1] link[https://mail.example/thread-1] subject[Project update] category[jobs] actionItem[Review deck]',
    );
  });
});

describe('sendSummaryEmail', () => {
  test('sends HTML mail when enabled', () => {
    gas().sendSummaryEmail('<p>summary</p>');

    expect(globalThis.gasTestMocks.sentEmails).toEqual([
      {
        to: 'test@example.com',
        subject: expect.stringContaining('Daily Email Summary'),
        htmlBody: '<p>summary</p>',
      },
    ]);
  });
});

describe('archiveThreads', () => {
  test('archives non-personal categories when enabled', () => {
    createMockThread(globalThis.gasTestMocks, {
      id: 'thread-1',
      messages: [{ id: 'm1', date: new Date() }],
    });
    createMockThread(globalThis.gasTestMocks, {
      id: 'thread-2',
      messages: [{ id: 'm2', date: new Date() }],
    });

    gas().archiveThreads([
      sampleSummary,
      { ...sampleSummary, threadId: 'thread-2', category: 'personal' },
    ]);

    expect(globalThis.gasTestMocks.archivedThreadIds).toEqual(['thread-1']);
  });
});

describe('addLabels', () => {
  test('adds action-required label for actionable summaries', () => {
    createMockThread(globalThis.gasTestMocks, {
      id: 'thread-1',
      messages: [{ id: 'm1', date: new Date() }],
    });

    gas().addLabels([sampleSummary]);

    expect(globalThis.gasTestMocks.labelAssignments).toEqual([
      { threadId: 'thread-1', labelName: '🤖 EmailSummary/⚠️ ActionRequired' },
    ]);
  });

  test('skips labeling when action item is None', () => {
    createMockThread(globalThis.gasTestMocks, {
      id: 'thread-1',
      messages: [{ id: 'm1', date: new Date() }],
    });

    gas().addLabels([{ ...sampleSummary, actionItem: 'none' }]);

    expect(globalThis.gasTestMocks.labelAssignments).toHaveLength(0);
  });
});

describe('getOrCreateLabel', () => {
  test('creates nested labels and caches them', () => {
    const label = gas().getOrCreateLabel('🤖 EmailSummary/⚠️ ActionRequired');

    expect(label.getName()).toBe('🤖 EmailSummary/⚠️ ActionRequired');
    expect([...globalThis.gasTestMocks.gmailLabels.keys()]).toEqual([
      '🤖 EmailSummary',
      '🤖 EmailSummary/⚠️ ActionRequired',
    ]);

    const cached = gas().getOrCreateLabel('🤖 EmailSummary/⚠️ ActionRequired');
    expect(cached).toBe(label);
    expect(
      globalThis.gasTestMocks.consoleLogs.some((line) => line.includes('Label found in cache')),
    ).toBe(true);
  });
});
