/**
 * Orchestration entry point for the daily email summary pipeline.
 */

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
