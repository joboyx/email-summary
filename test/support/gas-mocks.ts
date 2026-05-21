/**
 * Minimal Google Apps Script service mocks for local Jest runs.
 */
export function createGasTestMocks(): GasTestMocks {
  return {
    sessionEmail: 'test@example.com',
    scriptProperties: { OPENROUTER_API_KEY: 'test-api-key' },
    urlFetchResponses: [],
    urlFetchCalls: [],
    sentEmails: [],
    gmailThreads: new Map(),
    gmailLabels: new Map(),
    archivedThreadIds: [],
    labelAssignments: [],
    consoleLogs: [],
    consoleWarnings: [],
    consoleErrors: [],
    sleepCalls: [],
  };
}

export function resetGasTestMocks(mocks: GasTestMocks): void {
  mocks.urlFetchResponses = [];
  mocks.urlFetchCalls = [];
  mocks.sentEmails = [];
  mocks.gmailThreads = new Map();
  mocks.gmailLabels = new Map();
  mocks.archivedThreadIds = [];
  mocks.labelAssignments = [];
  mocks.consoleLogs = [];
  mocks.consoleWarnings = [];
  mocks.consoleErrors = [];
  mocks.sleepCalls = [];
  mocks.scriptProperties = { OPENROUTER_API_KEY: 'test-api-key' };
}

export function installGasMocks(mocks: GasTestMocks, target: typeof globalThis = globalThis): void {
  const globals = target as unknown as Record<string, unknown>;
  globals.gasTestMocks = mocks;

  globals.Session = {
    getActiveUser: () => ({
      getEmail: () => mocks.sessionEmail,
    }),
  };

  globals.PropertiesService = {
    getScriptProperties: () => ({
      getProperty: (key: string) => mocks.scriptProperties[key] ?? null,
    }),
  };

  globals.Utilities = {
    sleep: (ms: number) => {
      mocks.sleepCalls.push(ms);
    },
  };

  globals.console = {
    log: (...args: unknown[]) => {
      mocks.consoleLogs.push(args.map(String).join(' '));
    },
    warn: (...args: unknown[]) => {
      mocks.consoleWarnings.push(args.map(String).join(' '));
    },
    error: (...args: unknown[]) => {
      mocks.consoleErrors.push(args.map(String).join(' '));
    },
  };

  globals.UrlFetchApp = {
    fetch: (url: string, options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions) => {
      mocks.urlFetchCalls.push({ url, options: options ?? {} });
      const next = mocks.urlFetchResponses.shift();
      if (!next) {
        throw new Error(`UrlFetchApp.fetch called without a queued response for ${url}`);
      }

      return {
        getResponseCode: () => next.status,
        getContentText: () => next.body,
      };
    },
  };

  globals.MailApp = {
    sendEmail: (data: GoogleAppsScript.Mail.MailAdvancedParameters) => {
      mocks.sentEmails.push(data);
    },
  };

  globals.GmailApp = {
    search: (query: string) => {
      void query;
      return [...mocks.gmailThreads.values()] as unknown as GoogleAppsScript.Gmail.GmailThread[];
    },
    getThreadById: (threadId: string) => {
      const thread = mocks.gmailThreads.get(threadId);
      if (!thread) {
        throw new Error(`Missing mock thread ${threadId}`);
      }
      return thread as unknown as GoogleAppsScript.Gmail.GmailThread;
    },
    getUserLabelByName: (name: string) => {
      const label = mocks.gmailLabels.get(name);
      if (!label) {
        return null;
      }

      return label as unknown as GoogleAppsScript.Gmail.GmailLabel;
    },
    createLabel: (name: string) => {
      const label: MockGmailLabel = {
        name,
        getName: () => name,
      };
      mocks.gmailLabels.set(name, label);
      return label as unknown as GoogleAppsScript.Gmail.GmailLabel;
    },
    moveThreadToArchive: (thread: GoogleAppsScript.Gmail.GmailThread) => {
      mocks.archivedThreadIds.push(thread.getId());
    },
  };
}

export function createMockThread(
  mocks: GasTestMocks,
  options: {
    id: string;
    permalink?: string;
    messages: {
      id: string;
      date: Date;
      from?: string;
      subject?: string;
      plainBody?: string;
    }[];
  },
): MockGmailThread {
  const thread: MockGmailThread = {
    id: options.id,
    messages: [],
    labels: [],
    permalink: options.permalink ?? `https://mail.example/${options.id}`,
    getId: () => thread.id,
    getMessages: () => thread.messages,
    getPermalink: () => thread.permalink,
    addLabel: (label: MockGmailLabel) => {
      thread.labels.push(label.name);
      mocks.labelAssignments.push({ threadId: thread.id, labelName: label.name });
    },
  };

  thread.messages = options.messages.map((message) => ({
    id: message.id,
    date: message.date,
    from: message.from ?? 'sender@example.com',
    subject: message.subject ?? 'Subject',
    plainBody: message.plainBody ?? 'Body',
    thread,
    getId: () => message.id,
    getDate: () => message.date,
    getFrom: () => message.from ?? 'sender@example.com',
    getSubject: () => message.subject ?? 'Subject',
    getPlainBody: () => message.plainBody ?? 'Body',
    getThread: () => thread as unknown as GoogleAppsScript.Gmail.GmailThread,
  }));

  mocks.gmailThreads.set(thread.id, thread);
  return thread;
}
