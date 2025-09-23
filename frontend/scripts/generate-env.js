#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read environment variables with defaults
const environment = {
  apiUrl: process.env.API_URL || 'http://localhost:8000/api/',
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'your-default-stripe-key',
};

// Generate the environment.ts file content
const envFileContent = `export const environment = ${JSON.stringify(environment, null, 2)};
`;

// Write to the environment.ts file
const envFilePath = path.join(__dirname, '../src/app/common/environment.ts');
fs.writeFileSync(envFilePath, envFileContent);

console.log('Environment configuration generated successfully');
console.log('Environment values:', environment);
