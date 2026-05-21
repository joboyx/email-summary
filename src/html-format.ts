/**
 * HTML digest email builder and category legend rendering.
 */

/**
 * Render summarized emails as the HTML body sent in the daily digest.
 * @param summaries Categorized summaries produced by OpenRouter.
 * @returns Self-contained HTML document fragment for MailApp.
 */
function formatSummariesAsHTML(summaries: EmailSummary[]): string {
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

  summaries.forEach((summary) => {
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
  EMAIL_CATEGORIES.forEach((category) => {
    html += `<div style='margin: 8px 0;'>${category.emoji} ${category.name} - ${category.description}</div>`;
  });
  html += `
        </div>
        <p style='margin-top: 40px;'>Regards,<br>Your Automation Script</p>
      </div>
    </div>`;

  return html;
}
