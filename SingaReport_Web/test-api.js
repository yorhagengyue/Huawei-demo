// Simple script for testing API
const http = require('http');
const https = require('https');
const fs = require('fs');

// Configuration
const config = {
  host: 'localhost',
  port: 3000,
  authEndpoint: '/api/auth/login',
  fileListEndpoint: '/api/files/list',
  credentials: {
    email: 'test@example.com',
    password: 'password123'
  }
};

// Save authentication token
let authToken = null;

// Function to send request
function sendRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const httpModule = options.protocol === 'https:' ? https : http;
    
    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonResponse
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Login function
async function login() {
  console.log('Logging in...');
  
  const options = {
    host: config.host,
    port: config.port,
    path: config.authEndpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await sendRequest(options, config.credentials);
    
    if (response.statusCode === 200) {
      console.log('Login successful!');
      console.log('User information:', response.data.user);
      
      // Extract authentication token from the Set-Cookie header
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        for (const cookie of cookies) {
          const match = cookie.match(/auth_token=([^;]+)/);
          if (match) {
            authToken = match[1];
            console.log('Authentication token:', authToken.substring(0, 20) + '...');
            break;
          }
        }
      }
      
      return true;
    } else {
      console.error('Login failed:', response.statusCode, response.data);
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Function to get file list
async function getFilesList() {
  console.log('Getting file list...');
  
  if (!authToken) {
    console.error('Not authenticated, please login first');
    return;
  }
  
  const options = {
    host: config.host,
    port: config.port,
    path: config.fileListEndpoint,
    method: 'GET',
    headers: {
      'Cookie': `auth_token=${authToken}`
    }
  };
  
  try {
    const response = await sendRequest(options);
    
    if (response.statusCode === 200) {
      console.log('File list retrieved successfully!');
      console.log('Pagination information:', response.data.pagination);
      console.log('Number of files:', response.data.files.length);
      
      // Display file list
      if (response.data.files.length > 0) {
        console.log('\nFile list:');
        response.data.files.forEach((file, index) => {
          console.log(`${index + 1}. ${file.fileName} (${file.fileType}) - ${file.fileSize} bytes`);
        });
      } else {
        console.log('No files available');
      }
    } else {
      console.error('Failed to get file list:', response.statusCode, response.data);
    }
  } catch (error) {
    console.error('Error getting file list:', error);
  }
}

// Main function
async function main() {
  console.log('API test started');
  
  // Login
  const loginSuccess = await login();
  
  if (loginSuccess) {
    // Get file list
    await getFilesList();
  }
  
  console.log('API test completed');
}

// Execute main function
main().catch(error => {
  console.error('Error executing test:', error);
}); 