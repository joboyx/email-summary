/**
 * Gmail side effects: send digest, archive threads, apply labels, and label cache.
 */

function sendSummaryEmail(formattedSummary) {
  if (!EMAIL_SEND_ENABLED) {
    return;
  }

  const data = {
    to: EMAIL_RECIPIENT,
    subject: EMAIL_SUBJECT,
    htmlBody: formattedSummary
  };

  MailApp.sendEmail(data);
}

function archiveThreads(emails) {
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

function addLabels(emails) {
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

const labelCache = {};
/**
 * Get or create a label. Supported nested labels.
 * Auto-creates labels in every level
 */
function getOrCreateLabel(labelName) {
  if (labelCache[labelName]) {
    console.log("Label found in cache: " + labelName);
    return labelCache[labelName];
  }

  const labelParts = labelName.split('/');
  let currentLabelPath = '';

  for (const part of labelParts) {
    currentLabelPath = currentLabelPath ? `${currentLabelPath}/${part}` : part;
    let label = GmailApp.getUserLabelByName(currentLabelPath);

    if (!label) {
      console.log("Label not found. Creating: " + currentLabelPath);
      label = GmailApp.createLabel(currentLabelPath);
    } else {
      console.log("Label exists: " + label.getName());
    }

    labelCache[currentLabelPath] = label;
  }

  return labelCache[labelName];
}

/**
 * Explain the email in a human-readable format
 */
function explainEmail(email) {
  return `threadId[${email.threadId}] messageId[${email.messageId}] link[${email.link}] subject[${email.subject}] category[${email.category}] actionItem[${email.actionItem}]`;
}
