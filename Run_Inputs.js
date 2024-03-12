const fs = require('fs');
require('dotenv').config();

// Read variables from the text file
fs.readFile('variables.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Split data into lines
  const lines = data.split('\n');

  // Parse key-value pairs and write to .env file
  const envData = lines.reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      acc += `${key.trim()}=${value.trim()}\n`;
    }
    return acc;
  }, '');

  // Write to .env file
  fs.writeFile('.env', envData, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Variables written to .env file successfully');
  });
});