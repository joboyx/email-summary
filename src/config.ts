/**
 * Runtime configuration: side-effect flags, search limits, categories, and OpenRouter constants.
 */

/*
 * DEBUG
 */
const EMAIL_SEND_ENABLED = true; // !!! should be `true` by default
const EMAIL_ARCHIVE_ENABLED = true; // !!! should be `true` by default
const EMAIL_LABEL_ENABLED = true; // !!! should be `true` by default
const EMAIL_SEARCH_PREVIOUS_DAYS = 1; // !!! should be `1` by default
const EMAIL_SEARCH_RESULT_LIMIT: number | undefined = undefined; // !!! should be `undefined` by default for limitless, otherwise set to a number

const EMAIL_RECIPIENT = Session.getActiveUser().getEmail();
const EMAIL_SUBJECT = `📝 Daily Email Summary for ${new Date().toISOString().split('T')[0]}`;
const EMAIL_MAX_CONTENT_LENGTH = 1000000;
const EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE = ['personal'];
const EMAIL_LABEL_ROOT = '🤖 EmailSummary';
const EMAIL_LABEL_ACTION_REQUIRED = `${EMAIL_LABEL_ROOT}/⚠️ ActionRequired`;

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY =
  PropertiesService.getScriptProperties().getProperty('OPENROUTER_API_KEY');
const OPENROUTER_MODEL = 'x-ai/grok-4.5';
const OPENROUTER_MAX_TOKENS = 250000;
const OPENROUTER_MAX_RETRIES = 3;
const OPENROUTER_RETRY_DELAY_MS = 2000;

const EMAIL_CATEGORIES: EmailCategory[] = [
  { name: 'marketing', emoji: '📢', description: 'Promotional content, ads, special offers' },
  {
    name: 'personal',
    emoji: '👥',
    description: 'Messages from family, friends, personal contacts',
  },
  { name: 'social-media', emoji: '📱', description: 'Notifications from social platforms' },
  { name: 'transactions', emoji: '💳', description: 'Purchase receipts, orders, subscriptions' },
  { name: 'jobs', emoji: '💼', description: 'Job postings, recruiter emails' },
  { name: 'spam', emoji: '🚫', description: 'Unwanted or junk emails' },
  { name: 'newsletter', emoji: '📰', description: 'Subscriptions to newsletters and blogs' },
  { name: 'support', emoji: '🛟', description: 'Customer service and helpdesk communications' },
  { name: 'notifications', emoji: '🔔', description: 'System notifications and alerts' },
];
