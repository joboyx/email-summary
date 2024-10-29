/*
 * DEBUG
 */
const EMAIL_SEND_ENABLED = true; // !!! should be `true` by default
const EMAIL_ARCHIVE_ENABLED = true; // !!! should be `true` by default
const EMAIL_SEARCH_PREVIOUS_DAYS = 1; // !!! shoulde be `1` by default
const EMAIL_SEARCH_RESULT_LIMIT = undefined; // !!! should be `undefined` by default for limitless

const EMAIL_RECIPIENT = Session.getActiveUser().getEmail();
const EMAIL_SUBJECT = `Daily Email Summary for ${new Date().toISOString().split('T')[0]}`;
const EMAIL_BODY_TEMPLATE = `Hello,<br><br>Here is your summary of yesterday's emails:<br><br>{formattedSummary}<br><br>Regards,<br>Your Automation Script`;
const EMAIL_MAX_CONTENT_LENGTH = 500;
const EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE = ["personal"];

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_MAX_TOKENS = 1000;

function summarizeAndSendDailyEmail() {
  try {
  const previousDayEmails = getPreviousDayEmails();
  const emailSummaries = summarizeEmails(previousDayEmails);
  const formattedSummary = formatSummariesAsHTML(emailSummaries);
  sendSummaryEmail(formattedSummary);
  archiveThreads(emailSummaries);
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
  let emails = [];

  threads = threads.slice(0, EMAIL_SEARCH_RESULT_LIMIT);

  for (const thread of threads) {
    const messages = thread.getMessages();
    messages.forEach(message => {
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
  let summaries = [];

  emails.forEach(email => {
    const payload = {
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content:
            `
            Summarize the following email, categorize it, and determine if there's any action item for the recipient:
              Subject: ${email.subject}
              Content: ${email.content}
              Category List: 
                - marketing: Emails related to promotional content, ads, special offers, or marketing campaigns.
                - personal: Messages from family, friends, or personal contacts.
                - social-media: Notifications and updates from social media platforms like Facebook, Instagram, etc.
                - transactions: Purchase receipts, orders, subscriptions, and payment-related emails.
                - jobs: Job postings, recruiter emails, and curated job matches.
                - spam: Unwanted or junk emails that are often promotional or unsolicited.
                - newsletter: Subscriptions to newsletters, blogs, and regular informational updates.
                - support: Customer service inquiries, support requests, and helpdesk communications.
                - notifications: System notifications, alerts, and updates from apps or services.
            Guidelines:
              - summary should be very concise and can be just phrases
              - note that user is already familiar with types of emails they receive
              - for actionItem:
                - Only highlight action items if they're essential or time-sensitive:
                  - Impacts work, commitments, or deadlines
                  - Requires urgent follow-up (e.g., support tickets, job interviews)
                  - Important personal actions (e.g., family updates)
                - Skip optional or informational items (e.g., general marketing, social media updates).
                - If reading the summary is enough, no action item is needed.
            Output should be in the following format:
              summary: <short summary>
              category: <category>
              actionItem: <only if there's a valid action item based on guidelines above; otherwise "None">
            `
        }
      ],
      max_tokens: OPENAI_MAX_TOKENS,
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
  let html = "<table border='1' style='border-collapse:collapse;width:100%'><tr><th>Summary</th><th>Category</th><th>From</th><th>Link</th><th>Action Item</th></tr>";

  summaries.forEach(summary => {
    html += `<tr><td>${summary.summary}</td><td>${summary.category}</td><td>${summary.from}</td><td><a href="${summary.link}">View Email</a></td><td>${summary.actionItem}</td></tr>`;
  });

  html += "</table>";
  return html;
}

function sendSummaryEmail(formattedSummary) {
  if (!EMAIL_SEND_ENABLED) {
    return;
  }

  const body = EMAIL_BODY_TEMPLATE.replace("{formattedSummary}", formattedSummary);
  const data = {
    to: EMAIL_RECIPIENT,
    subject: EMAIL_SUBJECT,
    htmlBody: body
  };

  MailApp.sendEmail(data);
}

function archiveThreads(emails) {
  if (!EMAIL_ARCHIVE_ENABLED) {
    return;
  }

  for (const email of emails) {
    const isCategoryForArchive = !EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE.includes(email.category);
    const hasActionItem = email.actionItem && email.actionItem.toLowerCase() !== 'none'

    if (isCategoryForArchive && !hasActionItem) {
      const thread = GmailApp.getThreadById(email.threadId);
      GmailApp.moveThreadToArchive(thread);
      console.log(`Moved to Archive: threadId[${email.threadId}] messageId[${email.messageId}] link[${email.link}] subject[${email.subject}] category[${email.category}] actionItem[${email.actionItem}]`);
    } else {
      console.log(`Skipped Archive: threadId[${email.threadId}] messageId[${email.messageId}] link[${email.link}] subject[${email.subject}] category[${email.category}] actionItem[${email.actionItem}]`);
    }
  }
}
