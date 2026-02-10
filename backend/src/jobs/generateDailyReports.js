// src/jobs/generateDailyReports.js
const DailyReport = require('../models/DailyReport');
require('dotenv').config();

async function generateYesterdayReports() {
  try {
    console.log('🕐 Starting daily report generation...');
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    
    // Generate reports for yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    console.log(`📅 Generating reports for: ${dateStr}`);
    
    const reports = await DailyReport.generate(yesterday);
    
    console.log(`✅ Successfully generated ${reports.length} daily reports`);
    console.log('📊 Report breakdown:');
    
    reports.forEach(report => {
      console.log(`  - Campaign ${report.campaign_id}: ${report.impressions} impressions, ${report.clicks} clicks, $${report.spend}`);
    });
    
    return reports;
  } catch (error) {
    console.error('❌ Error generating daily reports:', error);
    throw error;
  }
}

// If run directly from command line
if (require.main === module) {
  generateYesterdayReports()
    .then(() => {
      console.log('✅ Daily report generation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to generate reports:', error);
      process.exit(1);
    });
}

module.exports = generateYesterdayReports;
