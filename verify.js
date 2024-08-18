import { exec } from 'child_process';

const PROJECT_ID = 'hq-madi-dev-4ebd7d92';

async function getAccessToken() {
    return new Promise((resolve, reject) => {
        exec('gcloud auth print-access-token', (error, stdout, stderr) => {
            if (error) {
                reject(`Error getting access token: ${stderr}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

async function getOAuthBrand() {
    return new Promise((resolve, reject) => {
        exec(`gcloud alpha iap oauth-brands list --project=${PROJECT_ID} --format="value(name)"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error getting OAuth brand: ${stderr}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

async function getOAuthClientId() {
    return new Promise((resolve, reject) => {
        // brandName = 'projects/hq-madi-dev-4ebd7d92/iap_web';
        exec(`gcloud alpha iap oauth-clients list projects/351312167908/brands/351312167908  --format="value(name)"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error getting OAuth client ID: ${stderr}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

async function verifyAccessToken() {
    try {
        const accessToken = await getAccessToken();
        const brandName = await getOAuthBrand();
        const clientId = await getOAuthClientId();
        console.log('clientID:', clientId);
        const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`;

        const response = await fetch(tokenInfoUrl);
        if (!response.ok) {
            throw new Error(`Token verification failed: ${response.statusText}`);
        }

        const tokenInfo = await response.json();
        console.log('Token info:', tokenInfo);

        // Check if the token is valid for your application
        if (tokenInfo.aud === clientId) {
            console.log('Token is valid');
        } else {
            console.log('Token is not valid for this client ID');
        }
    } catch (error) {
        console.error('Error verifying access token:', error);
    }
}

// Example usage
verifyAccessToken();