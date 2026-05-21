/**
 * OpenRouter API client and email summarization prompt/parse logic.
 */

/**
 * POST to OpenRouter chat/completions with 429 retry and structured error handling.
 * @param {Object} payload Chat completions request body.
 * @returns {Object} Parsed completion JSON with choices[0].message.content.
 */
function fetchOpenRouterChatCompletion(payload) {
  const options = {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://script.google.com",
      "X-Title": "email-summary",
    },
    payload: JSON.stringify(payload),
  };

  let lastError = null;

  for (let attempt = 1; attempt <= OPENROUTER_MAX_RETRIES; attempt++) {
    const response = UrlFetchApp.fetch(OPENROUTER_API_URL, options);
    const status = response.getResponseCode();
    const text = response.getContentText();
    let json;

    try {
      json = JSON.parse(text);
    } catch (parseError) {
      lastError = new Error(`OpenRouter returned non-JSON (HTTP ${status})`);
      if (status === 429 && attempt < OPENROUTER_MAX_RETRIES) {
        console.warn(`OpenRouter HTTP 429 (attempt ${attempt}/${OPENROUTER_MAX_RETRIES}), retrying in ${OPENROUTER_RETRY_DELAY_MS}ms`);
        Utilities.sleep(OPENROUTER_RETRY_DELAY_MS);
        continue;
      }
      throw lastError;
    }

    console.log("llm: ", JSON.stringify(json, undefined, 2));

    const isRateLimited = status === 429 || json.error?.code === 429;

    if (isRateLimited) {
      lastError = new Error(`OpenRouter rate limited: ${json.error?.message || text.substring(0, 200)}`);
      if (attempt < OPENROUTER_MAX_RETRIES) {
        console.warn(`OpenRouter 429 (attempt ${attempt}/${OPENROUTER_MAX_RETRIES}), retrying in ${OPENROUTER_RETRY_DELAY_MS}ms`);
        Utilities.sleep(OPENROUTER_RETRY_DELAY_MS);
        continue;
      }
      throw lastError;
    }

    if (json.error) {
      throw new Error(`OpenRouter error ${json.error.code || status}: ${json.error.message || JSON.stringify(json.error)}`);
    }

    if (status < 200 || status >= 300) {
      throw new Error(`OpenRouter HTTP ${status}: ${text.substring(0, 200)}`);
    }

    if (!json.choices?.[0]?.message?.content) {
      throw new Error("OpenRouter response missing choices[0].message.content");
    }

    return json;
  }

  throw lastError || new Error("OpenRouter request failed after retries");
}

function summarizeEmails(emails) {
  const summaries = [];

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY script property is not set. Add it in Apps Script > Project Settings > Script properties.");
  }

  emails.forEach(email => {
    // Convert EMAIL_CATEGORIES to YAML format
    const categoryList = EMAIL_CATEGORIES.map(cat =>
      `  - name: ${cat.name}\n    emoji: ${cat.emoji}\n    description: ${cat.description}`
    ).join('\n');

    const payload = {
      model: OPENROUTER_MODEL,
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
      max_completion_tokens: OPENROUTER_MAX_TOKENS,
      reasoning: { effort: "low", exclude: true },
    };

    try {
      const json = fetchOpenRouterChatCompletion(payload);
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
