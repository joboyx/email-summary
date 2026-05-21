/**
 * Orchestration entry point for the daily email summary pipeline.
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
