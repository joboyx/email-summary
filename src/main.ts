/**
 * Orchestration entry point for the daily email summary pipeline.
 */

/**
 * Fetch yesterday's inbox messages, summarize them, send the digest, then archive and label threads.
 * @returns Success or failure result for clasp runs and trigger failure notifications.
 */
function summarizeAndSendDailyEmail(): DailySummaryResult {
  try {
    const previousDayEmails = getPreviousDayEmails();
    const emailSummaries = summarizeEmails(previousDayEmails);
    const formattedSummary = formatSummariesAsHTML(emailSummaries);
    sendSummaryEmail(formattedSummary);
    archiveThreads(emailSummaries);
    addLabels(emailSummaries);
    return { success: true, message: 'Email summary processed successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in summarizeAndSendDailyEmail:', error);
    return { success: false, message };
  }
}
