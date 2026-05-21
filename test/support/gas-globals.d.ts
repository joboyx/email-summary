/**
 * Global Apps Script surface exposed by the test harness after loading src/.
 */
interface GasTestGlobals {
  EMAIL_SEND_ENABLED: boolean;
  EMAIL_ARCHIVE_ENABLED: boolean;
  EMAIL_LABEL_ENABLED: boolean;
  EMAIL_SEARCH_PREVIOUS_DAYS: number;
  EMAIL_SEARCH_RESULT_LIMIT: number | undefined;
  EMAIL_RECIPIENT: string;
  EMAIL_SUBJECT: string;
  EMAIL_MAX_CONTENT_LENGTH: number;
  EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE: string[];
  EMAIL_LABEL_ROOT: string;
  EMAIL_LABEL_ACTION_REQUIRED: string;
  OPENROUTER_API_URL: string;
  OPENROUTER_API_KEY: string | null;
  OPENROUTER_MODEL: string;
  OPENROUTER_MAX_TOKENS: number;
  OPENROUTER_MAX_RETRIES: number;
  OPENROUTER_RETRY_DELAY_MS: number;
  EMAIL_CATEGORIES: EmailCategory[];
  labelCache: Record<string, GoogleAppsScript.Gmail.GmailLabel>;

  getSearchStringForLastNDays: (n: number) => string;
  getPreviousDayEmails: () => EmailInput[];
  fetchOpenRouterChatCompletion: (
    payload: OpenRouterChatCompletionRequest,
  ) => OpenRouterChatCompletionResponse;
  parseSummaryLine: (lines: string[], prefix: string) => string;
  summarizeEmails: (emails: EmailInput[]) => EmailSummary[];
  formatSummariesAsHTML: (summaries: EmailSummary[]) => string;
  sendSummaryEmail: (formattedSummary: string) => void;
  archiveThreads: (emails: EmailSummary[]) => void;
  addLabels: (emails: EmailSummary[]) => void;
  getOrCreateLabel: (labelName: string) => GoogleAppsScript.Gmail.GmailLabel;
  explainEmail: (email: EmailSummary) => string;
  summarizeAndSendDailyEmail: () => DailySummaryResult;
}

interface GasTestMocks {
  sessionEmail: string;
  scriptProperties: Record<string, string | null>;
  urlFetchResponses: UrlFetchMockResponse[];
  urlFetchCalls: Array<{ url: string; options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions }>;
  sentEmails: GoogleAppsScript.Mail.MailAdvancedParameters[];
  gmailThreads: Map<string, MockGmailThread>;
  gmailLabels: Map<string, MockGmailLabel>;
  archivedThreadIds: string[];
  labelAssignments: Array<{ threadId: string; labelName: string }>;
  consoleLogs: string[];
  consoleWarnings: string[];
  consoleErrors: string[];
  sleepCalls: number[];
}

interface UrlFetchMockResponse {
  status: number;
  body: string;
}

interface MockGmailLabel {
  name: string;
  getName: () => string;
}

interface MockGmailMessage {
  id: string;
  date: Date;
  from: string;
  subject: string;
  plainBody: string;
  thread: MockGmailThread;
}

interface MockGmailThread {
  id: string;
  messages: MockGmailMessage[];
  labels: string[];
  permalink: string;
  getId: () => string;
  getMessages: () => MockGmailMessage[];
  getPermalink: () => string;
  addLabel: (label: MockGmailLabel) => void;
}

declare var gasTestMocks: GasTestMocks;
