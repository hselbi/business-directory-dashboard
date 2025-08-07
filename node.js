const fs = require('fs');
const credentials = fs.readFileSync('./credentials/service-account.json', 'utf8');
const encodedCredentials = Buffer.from(credentials).toString('base64');
console.log(encodedCredentials);