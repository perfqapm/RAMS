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

  // Parse key-value pairs and write to 1.env file
  const envData = lines.reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      acc += `${key.trim()}=${value.trim()}\n`;
    }
    return acc;
  }, '');

  // Write to 1.env file
  fs.writeFile('1.env', envData, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Variables written to 1.env file successfully');
  });
});
