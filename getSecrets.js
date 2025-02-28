const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getSecrets(secretName) {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: 'my-app-secrets' }).promise();
    return JSON.parse(data.SecretString); // Parse and return the secrets
  } catch (error) {
    console.error('Error retrieving secrets:', error);
    throw error;
  }
}

module.exports = getSecrets;
