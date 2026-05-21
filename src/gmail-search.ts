/**
 * Gmail search string construction and message retrieval/normalization.
 */

function getSearchStringForLastNDays(n: number): string {
  const today = new Date();
  const nDaysAgo = new Date(today);
  nDaysAgo.setDate(today.getDate() - n);

  const year = nDaysAgo.getFullYear();
  const month = (nDaysAgo.getMonth() + 1).toString().padStart(2, "0");
  const day = nDaysAgo.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}/${month}/${day}`;

  return `after:${formattedDate}`;
}

function getPreviousDayEmails(): EmailInput[] {
  const searchString = `in:inbox ${getSearchStringForLastNDays(EMAIL_SEARCH_PREVIOUS_DAYS)} -subject:"${EMAIL_SUBJECT.split(" for")[0]}"`;
  console.log("searchString: ", searchString);
  let threads = GmailApp.search(searchString);
  const emails: EmailInput[] = [];

  threads = threads.slice(0, EMAIL_SEARCH_RESULT_LIMIT);

  const today = new Date();
  const nDaysAgo = new Date(today);
  nDaysAgo.setDate(today.getDate() - EMAIL_SEARCH_PREVIOUS_DAYS);
  nDaysAgo.setHours(0, 0, 0, 0);

  for (const thread of threads) {
    const messages = thread.getMessages();

    const recentMessages = messages.filter((message) => message.getDate() >= nDaysAgo);

    recentMessages.forEach((message) => {
      const email: EmailInput = {
        threadId: thread.getId(),
        messageId: message.getId(),
        messageDate: message.getDate().toISOString(),
        from: message.getFrom(),
        subject: message.getSubject(),
        content: message.getPlainBody().substring(0, EMAIL_MAX_CONTENT_LENGTH),
        link: message.getThread().getPermalink(),
      };
      console.log("email: ", JSON.stringify(email, undefined, 2));
      emails.push(email);
    });
  }

  return emails;
}
