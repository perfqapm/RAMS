const fs = require('fs');
require('dotenv').config();

// Read the content of the .txt file
fs.readFile('./variables.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // Split the content by newlines
    const lines = data.split('\n');

    // Write each line to the .env file
    const stream = fs.createWriteStream('./.env', { flags: 'a' });
    lines.forEach(line => {
        stream.write(line.trim() + '\n');
    });

    // Close the stream
    stream.end();
});
