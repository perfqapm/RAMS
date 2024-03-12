const nodemailer = require('nodemailer');
const fs = require('fs');
const csvParser = require('csv-parser');
const moment = require('moment-timezone');
require('dotenv').config({ path: './.env' });
const assertionErrorCount = process.env.assertionErrorCount;
const assertionOkCount = process.env.assertionOkCount;
const statusNotOkCount = process.env.statusNotOkCount;
const statusOkCount = process.env.statusOkCount;
const iterationCount = process.env.iterationCount;
const totalAPIsCount = process.env.totalAPIsCount;

const emailAddress = process.env.EMAIL_IDS;

let totalAssertions = parseInt(assertionErrorCount) + parseInt(assertionOkCount);
let totalRequestCount = parseInt(statusNotOkCount) + parseInt(statusOkCount);
// let totalAPIsCount = parseInt(totalRequestCount) / parseInt(iterationCount);

const yargs = require('yargs');

let params = yargs.argv;

// let emailAddress;
let gmailPassword;

// try {
//   console.log(process.argv);

//   // if more than one email ids are there, split
//   let temp = params.emails.replace(' ', '');
//   if (temp.includes(',')) {
//     emailAddress = temp.split(',');
//   } else {
//     emailAddress = temp;
//   }

//   console.log('Email Ids: ' + emailAddress);

// } catch (error) {
//   console.log('Error reading the git action variables:' + error.message);
// }

// Helper function to generate a CSS class based on sort key
function getSortClass(sortKey, header) {
  return sortKey === header ? 'sorted-column' : '';
}

function sendEmail(assertionErrorCount, statusNotOkCount, assertionOkCount, statusOkCount, attachmentPaths) {
  try {
    // Set your desired timezone
    const timezone = 'Asia/Kolkata';

    // Get the current time in the specified timezone
    const timestamp = moment().tz(timezone).format('MMMM Do YYYY, h:mm a');

    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., 'Gmail'
      auth: {
        user: 'ramsnotification@gmail.com',
        pass: 'uwyvhdauoxuabayb',
      },
    });

    // Read the CSV file and extracting insights
    const csvData = [];
    fs.createReadStream('newman/CSVReport.csv')
      .pipe(csvParser())
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', () => {
        const headers = Object.keys(csvData[0]);

        // Sort the CSV data by "response time" in descending order
        const sortedByResponseTime = csvData.slice(0).sort((a, b) => b['responseTime'] - a['responseTime']);
        const top10ByResponseTime = sortedByResponseTime.slice(0, 10);

        // Sort the CSV data by "code" in descending order and then by "failedCount" in descending order
        const sortedByCode = csvData.slice(0).sort((a, b) => {
          if (a['code'] !== b['code']) {
            return b['code'] - a['code']; // Sort by "code" in descending order
          } else {
            return b['failedCount'] - a['failedCount']; // If codes are equal, sort by "failedCount" in descending order
          }
        });
        const top10ByCode = sortedByCode.slice(0, 10);

        // Generate HTML table for top 10 rows by "response time"
        let htmlTableResponseTime = '<h4 style="color: #6082B6;">Top Response Time:</h4>';
        htmlTableResponseTime += '<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">';
        htmlTableResponseTime += '<tr style="background-color: #B0C4DE;">';
        for (const header of headers) {
          const sortClass = getSortClass('responseTime', header); // Check if this column is sorted
          htmlTableResponseTime += `<th class="${sortClass}" style="padding: 8px; font-weight: ${sortClass ? 'bold' : 'normal'};">${header}</th>`;
        }
        htmlTableResponseTime += '</tr>';
        for (const row of top10ByResponseTime) {
          htmlTableResponseTime += '<tr style="background-color: #ADD8E6;">';
          for (const key in row) {
            const sortClass = getSortClass('responseTime', key); // Check if this column is sorted
            let cellStyle = ''; // Empty style attribute by default

            if (key === 'responseTime') {
              // Determine the background color based on the response time value
              if (row[key] >= 5000) {
                cellStyle = 'background-color: #FF0000;'; // Red for response time >= 2000 ms
              } else if (row[key] >= 1000) {
                cellStyle = 'background-color: #FFA500;'; // Orange for response time >= 1000 ms
              } else {
                cellStyle = 'background-color: #00FF00;'; // Green for response time < 1000 ms
              }
            }

            // Apply the CSS class and inline style to the cell
            htmlTableResponseTime += `<td class="${sortClass}" style="padding: 8px; font-weight: ${sortClass ? 'bold' : 'normal'}; ${cellStyle}">${row[key]}</td>`;
          }
          htmlTableResponseTime += '</tr>';
        }
        htmlTableResponseTime += '</table>';

        // Generate HTML table for top 10 rows by "code"
        let htmlTableCode = '<h4 style="color: #6082B6;">Top Response Codes:</h4>';
        htmlTableCode += '<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">';
        htmlTableCode += '<tr style="background-color: #B0C4DE;">';
        for (const header of headers) {
          const sortClass = getSortClass('code', header); // Check if this column is sorted
          const failedCountSortClass = header === 'failedCount' ? 'sorted-column' : ''; // Add custom class to "failedCount" header
          htmlTableCode += `<th class="${sortClass} ${failedCountSortClass}" style="padding: 8px; font-weight: ${sortClass || failedCountSortClass ? 'bold' : 'normal'};">${header}</th>`;
        }
        htmlTableCode += '</tr>';
        for (const row of top10ByCode) {
          htmlTableCode += '<tr style="background-color: #ADD8E6;">';
          for (const key in row) {
            const sortClass = getSortClass('code', key); // Check if this column is sorted
            let cellStyle = ''; // Empty style attribute by default

            if (key === 'code') {
              // Determine the background color based on the "code" value
              if (row[key] > 300) {
                cellStyle = 'background-color: #FF0000;'; // Red for code > 200
              }
            }

            // Apply the CSS class and inline style to the cell
            htmlTableCode += `<td class="${sortClass}" style="padding: 8px; font-weight: ${sortClass ? 'bold' : 'normal'}; ${cellStyle}">${row[key]}</td>`;
          }
          htmlTableCode += '</tr>';
        }
        htmlTableCode += '</table>';

        // Adding initial HTML content
        const AdditionalhtmlContent = `
          <h2 style="color: #6082B6;">API/WebServices Monitoring Solution Run Details!</h2>
          <p style="color: #6082B6;">No. of Requests in the Collection: ${totalAPIsCount}</p>
          <p style="color: #6082B6;">No. of Iterations executed: ${iterationCount}</p>
          <p style="color: #6082B6;">No. of Status codes Failed: ${statusNotOkCount} out of ${totalRequestCount}</p>
          <p style="color: #6082B6;">No. of Tests (Assertions) Failed: ${assertionErrorCount} out of ${totalAssertions}</p>
        `;

        const mailOptions = {
          from: 'ramsnotification@gmail.com',
          to: 'emailAddress',
          subject: '[API/WebServices Monitoring Solution] Run Status ! ' + timestamp,
          html: `<html><body>${AdditionalhtmlContent}${htmlTableResponseTime}${htmlTableCode}</body></html>`,
          attachments: attachmentPaths.map((path) => ({ path })),
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
      });
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = sendEmail;
