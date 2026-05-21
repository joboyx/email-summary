/**
 * Gmail side effects: send digest, archive threads, apply labels, and label cache.
 */

/**
 * Send the formatted digest to the configured recipient when sending is enabled.
 * @param formattedSummary HTML body produced by `formatSummariesAsHTML`.
 */
function sendSummaryEmail(formattedSummary: string): void {
  if (!EMAIL_SEND_ENABLED) {
    return;
  }

  const data: GoogleAppsScript.Mail.MailAdvancedParameters = {
    to: EMAIL_RECIPIENT,
    subject: EMAIL_SUBJECT,
    htmlBody: formattedSummary,
  };

  MailApp.sendEmail(data);
}

/**
 * Move summarized threads to archive when archiving is enabled and category allows it.
 * @param emails Summaries whose threads may be archived.
 */
function archiveThreads(emails: EmailSummary[]): void {
  if (!EMAIL_ARCHIVE_ENABLED) {
    return;
  }

  for (const email of emails) {
    const isCategoryForArchive = !EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE.includes(email.category);

    if (isCategoryForArchive) {
      const thread = GmailApp.getThreadById(email.threadId);
      GmailApp.moveThreadToArchive(thread);
      console.log(`Moved to Archive: ${explainEmail(email)}`);
    } else {
      console.log(`Skipped Archive: ${explainEmail(email)}`);
    }
  }
}

/**
 * Apply the action-required label to threads with a non-empty action item.
 * @param emails Summaries whose threads may receive labels.
 */
function addLabels(emails: EmailSummary[]): void {
  if (!EMAIL_LABEL_ENABLED) {
    return;
  }

  for (const email of emails) {
    const thread = GmailApp.getThreadById(email.threadId);
    const hasActionItem = email.actionItem && email.actionItem.toLowerCase() !== 'none';
    if (hasActionItem) {
      thread.addLabel(getOrCreateLabel(EMAIL_LABEL_ACTION_REQUIRED));
      console.log(`Added label: ${EMAIL_LABEL_ACTION_REQUIRED} to email: ${explainEmail(email)}`);
    }
  }
}

const labelCache: Record<string, GoogleAppsScript.Gmail.GmailLabel> = {};

/**
 * Get or create a label, including nested paths such as `Root/Child`.
 * Auto-creates missing labels at each path segment and caches lookups.
 * @param labelName Gmail label name, optionally nested with `/` separators.
 * @returns Existing or newly created Gmail label.
 */
function getOrCreateLabel(labelName: string): GoogleAppsScript.Gmail.GmailLabel {
  if (labelCache[labelName]) {
    console.log('Label found in cache: ' + labelName);
    return labelCache[labelName];
  }

  const labelParts = labelName.split('/');
  let currentLabelPath = '';

  for (const part of labelParts) {
    currentLabelPath = currentLabelPath ? `${currentLabelPath}/${part}` : part;
    let label = GmailApp.getUserLabelByName(currentLabelPath);

    if (!label) {
      console.log('Label not found. Creating: ' + currentLabelPath);
      label = GmailApp.createLabel(currentLabelPath);
    } else {
      console.log('Label exists: ' + label.getName());
    }

    labelCache[currentLabelPath] = label;
  }

  return labelCache[labelName];
}

/**
 * Format summary metadata for structured log lines.
 * @param email Summarized email whose identifiers should be logged.
 * @returns Single-line diagnostic string for archive and label logs.
 */
function explainEmail(email: EmailSummary): string {
  return `threadId[${email.threadId}] messageId[${email.messageId}] link[${email.link}] subject[${email.subject}] category[${email.category}] actionItem[${email.actionItem}]`;
}
