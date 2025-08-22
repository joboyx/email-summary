/*
 * DEBUG
 */
const EMAIL_SEND_ENABLED = true; // !!! should be `true` by default
const EMAIL_ARCHIVE_ENABLED = true; // !!! should be `true` by default
const EMAIL_LABEL_ENABLED = true; // !!! should be `true` by default
const EMAIL_SEARCH_PREVIOUS_DAYS = 1; // !!! shoulde be `1` by default
const EMAIL_SEARCH_RESULT_LIMIT = undefined; // !!! should be `undefined` by default for limitless, otherwise set to a number

const EMAIL_RECIPIENT = Session.getActiveUser().getEmail();
const EMAIL_SUBJECT = `📝 Daily Email Summary for ${new Date().toISOString().split('T')[0]}`;
const EMAIL_MAX_CONTENT_LENGTH = 500000;
const EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE = ["personal"];
const EMAIL_LABEL_ROOT = "🤖 EmailSummary";
const EMAIL_LABEL_ACTION_REQUIRED = `${EMAIL_LABEL_ROOT}/⚠️ ActionRequired`;

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
const OPENAI_MODEL = "gpt-5";
const OPENAI_MAX_TOKENS = 50000;

const EMAIL_CATEGORIES = [
  { name: "marketing", emoji: "📢", description: "Promotional content, ads, special offers" },
  { name: "personal", emoji: "👥", description: "Messages from family, friends, personal contacts" },
  { name: "social-media", emoji: "📱", description: "Notifications from social platforms" },
  { name: "transactions", emoji: "💳", description: "Purchase receipts, orders, subscriptions" },
  { name: "jobs", emoji: "💼", description: "Job postings, recruiter emails" },
  { name: "spam", emoji: "🚫", description: "Unwanted or junk emails" },
  { name: "newsletter", emoji: "📰", description: "Subscriptions to newsletters and blogs" },
  { name: "support", emoji: "🛟", description: "Customer service and helpdesk communications" },
  { name: "notifications", emoji: "🔔", description: "System notifications and alerts" }
];

function summarizeAndSendDailyEmail() {
  try {
    const previousDayEmails = getPreviousDayEmails();
    const emailSummaries = summarizeEmails(previousDayEmails);
    const formattedSummary = formatSummariesAsHTML(emailSummaries);
    sendSummaryEmail(formattedSummary);
    archiveThreads(emailSummaries);
    addLabels(emailSummaries);
    return { success: true, message: "Email summary processed successfully" };
  } catch (error) {
    console.error("Error in summarizeAndSendDailyEmail:", error);
    return { success: false, message: error.message };
  }
}

function getSearchStringForLastNDays(n) {
  // Calculate the date N days ago
  const today = new Date();
  const nDaysAgo = new Date(today);
  nDaysAgo.setDate(today.getDate() - n);

  // Format the date as yyyy/mm/dd
  const year = nDaysAgo.getFullYear();
  const month = (nDaysAgo.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
  const day = nDaysAgo.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}/${month}/${day}`;

  // Construct the Gmail search string
  const searchString = `after:${formattedDate}`;

  return searchString;
}


function getPreviousDayEmails() {
  const searchString = `in:inbox ${getSearchStringForLastNDays(EMAIL_SEARCH_PREVIOUS_DAYS)} -subject:"${EMAIL_SUBJECT.split(' for')[0]}"`;
  console.log("searchString: ", searchString);
  let threads = GmailApp.search(searchString);
  const emails = [];

  threads = threads.slice(0, EMAIL_SEARCH_RESULT_LIMIT);

  // Calculate the same date threshold used in Gmail search
  const today = new Date();
  const nDaysAgo = new Date(today);
  nDaysAgo.setDate(today.getDate() - EMAIL_SEARCH_PREVIOUS_DAYS);
  // Set to start of day to match Gmail's after: behavior
  nDaysAgo.setHours(0, 0, 0, 0);

  for (const thread of threads) {
    const messages = thread.getMessages();
    
    // Filter messages using the same date criteria as Gmail search
    const recentMessages = messages.filter(message => {
      return message.getDate() >= nDaysAgo;
    });
    
    recentMessages.forEach(message => {
      const email = {
        threadId: thread.getId(),
        messageId: message.getId(),
        messageDate: message.getDate().toISOString(),
        from: message.getFrom(),
        subject: message.getSubject(),
        content: message.getPlainBody().substring(0, EMAIL_MAX_CONTENT_LENGTH),
        link: message.getThread().getPermalink(),
      };
      console.log('email: ', JSON.stringify(email, undefined, 2));
      emails.push(email);
    });
  };

  return emails;
}

function summarizeEmails(emails) {
  const summaries = [];

  emails.forEach(email => {
    // Convert EMAIL_CATEGORIES to YAML format
    const categoryList = EMAIL_CATEGORIES.map(cat =>
      `  - name: ${cat.name}\n    emoji: ${cat.emoji}\n    description: ${cat.description}`
    ).join('\n');

    const payload = {
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content:
            `
            Summarize the following email, categorize it, and determine if there's any action item for the recipient:
              subject: ${email.subject}
              from: ${email.from}
              content: ${email.content}
              category-list: 
                \`\`\`yaml
                ${categoryList}
                \`\`\`
            Guidelines:
              - Content Focus (for emails with quoted/replied content):
                - This email may contain quoted/replied content from previous messages in the thread
                - Focus ONLY on the NEW message from the sender, NOT the quoted/replied portions
                - If this appears to be a reply, summarize what the sender is responding with, not the original message
              - category should be decided based on the content of the email and "category-list.description"
              - category should be one of the categories listed in the "category-list.name"
              - summary should be very concise and can be just phrases
              - summary should have the "category-list.emoji" of the "category-list.name" at the beginning
              - note that user is already familiar with types of emails they receive
              - for actionItem:
                - Only highlight action items if they're essential or time-sensitive:
                  - Impacts work, commitments, or deadlines
                  - Requires urgent follow-up (e.g., support tickets, job interviews)
                  - Important personal actions (e.g., family updates)
                - Skip optional or informational items (e.g., general marketing, social media updates).
                - If reading the summary is enough, no action item is needed.
            Output should be in the following format:
              category: <category-list.name>
              summary: <category-list.emoji> <short summary>
              actionItem: <only if there's a valid action item based on guidelines above; otherwise "None">
            `
        }
      ],
      max_completion_tokens: OPENAI_MAX_TOKENS,
    };

    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      payload: JSON.stringify(payload)
    };

    try {
      const response = UrlFetchApp.fetch(OPENAI_API_URL, options);
      const json = JSON.parse(response.getContentText());
      console.log("llm: ", JSON.stringify(json, undefined, 2));
      const summaryText = json.choices[0].message.content.split('\n');

      const summary = {
        ...email,
        summary: summaryText.find(line => line.startsWith("summary:")).replace("summary: ", "").trim(),
        category: summaryText.find(line => line.startsWith("category:")).replace("category: ", "").trim(),
        actionItem: summaryText.find(line => line.startsWith("actionItem:")).replace("actionItem: ", "").trim(),
      };

      // Validate the emoji in the summary
      const emoji = summary.summary.split(' ')[0];
      const validEmojis = EMAIL_CATEGORIES.map(cat => cat.emoji);
      if (!validEmojis.includes(emoji)) {
        console.warn(`Invalid emoji detected in summary: ${summary.summary}. Expected one of: ${validEmojis.join(', ')}`);
        summary.summary = `⚠️ Invalid emoji detected. Please review.`;
      }

      summaries.push(summary);
    } catch (error) {
      console.error(`Failed to summarize email: ${email.subject}. Error: ${error}`);
    }
  });

  summaries.sort((a, b) => {
    const categoryComparison = a.category.localeCompare(b.category);

    if (categoryComparison === 0) {
      return new Date(b.messageDate) - new Date(a.messageDate);
    }

    return categoryComparison;
  });

  console.log("summaries: ", JSON.stringify(summaries, undefined, 2));

  return summaries;
}

function formatSummariesAsHTML(summaries) {
  let html = `
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>
      <div style='background-color: #f4f4f4; padding: 20px; text-align: center;'>
        <h2 style='margin: 0; color: #333;'>Daily Email Summary</h2>
      </div>
      <div style='padding: 20px;'>
        <p>Hello,</p>
        <p>Here is your summary of yesterday's emails:</p>
        <table style='width: 100%; border-collapse: collapse;'>
          <tbody>`;

  summaries.forEach(summary => {
    html += `
            <tr style='border-bottom: 1px solid #eee;'>
              <td style='padding: 15px 0;'>
                <div style='font-size: 16px; font-weight: bold; margin-bottom: 8px;'>${summary.summary}</div>
                <div style='color: #666; font-size: 15px; margin-bottom: 4px;'><strong>Subject:</strong> ${summary.subject}</div>
                <div style='color: #666; font-size: 15px;'><strong>From:</strong> ${summary.from} | <strong>Category:</strong> ${summary.category}</div>`;

    if (summary.actionItem && summary.actionItem.toLowerCase() !== 'none') {
      html += `<div style='background: #fff3cd; padding: 8px; border-radius: 4px; margin-top: 8px;'>
                <span style='font-size: 18px;'>⚠️</span> ${summary.actionItem}
              </div>`;
    }

    html += `<div style='font-size: 13px; margin-top: 8px;'>
                <a href="${summary.link}" style='color: #0066cc; text-decoration: none;'>View Original Email →</a>
              </div>
              </td>
            </tr>`;
  });

  html += `
          </tbody>
        </table>
        <div style='margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;'>
          <strong>Categories:</strong><br>`;
  EMAIL_CATEGORIES.forEach(category => {
    html += `<div style='margin: 8px 0;'>${category.emoji} ${category.name} - ${category.description}</div>`;
  });
  html += `
        </div>
        <p style='margin-top: 40px;'>Regards,<br>Your Automation Script</p>
      </div>
    </div>`;

  return html;
}

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