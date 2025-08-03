import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read config file with error handling
let config;
try {
  config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
} catch (error) {
  console.error('Error reading config file:', error);
  config = {
    api: {
      auth: {
        tokenHeader: "Authorization"
      }
    },
    app: {
      maxFileSize: 5242880
    }
  };
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Add limit to prevent large payload attacks
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers[config.api.auth.tokenHeader.toLowerCase()];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    // Here you would typically verify the token
    // For now, we'll just check if it exists
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

// API Routes
app.post('/api/process-json', (req, res) => {
  try {
    const jsonData = req.body;
    
    // Validate input
    if (!jsonData || typeof jsonData !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON data provided' });
    }

    // File size validation (approximate, since req.body is already parsed)
    const maxFileSize = config.app.maxFileSize || 5242880;
    const jsonString = JSON.stringify(jsonData);
    if (Buffer.byteLength(jsonString, 'utf8') > maxFileSize) {
      return res.status(413).json({ 
        error: `File size exceeds the limit of ${maxFileSize / 1024 / 1024} MB` 
      });
    }

    // Extract specific fields
    const extractedData = {
      primaryProcessingResult: jsonData.PrimaryProcessingResult || null,
      processingResultRemarks: jsonData.ProcessingResultRemarks || [],
      metadata: {
        extractedAt: new Date().toISOString(),
        source: 'file_upload',
        size: Buffer.byteLength(jsonString, 'utf8')
      }
    };

    res.json(extractedData);
  } catch (error) {
    console.error('Error processing JSON:', error);
    res.status(500).json({ error: 'Failed to process JSON data' });
  }
});

app.get('/api/get-data/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const token = req.token;

    // Validate request ID
    if (!requestId || requestId.trim() === '') {
      return res.status(400).json({ success: false, error: 'Request ID is required' });
    }

    // Here you would make the actual API call to your external service
    // For now, we'll return a mock response
    const mockResponse = {
      requestId,
      data: {
        PrimaryProcessingResult: "Sample Result",
        ProcessingResultRemarks: "Sample Remarks"
      }
    };

    res.json({ success: true, data: mockResponse });
  } catch (error) {
    console.error('Error in get-data endpoint:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: config.app?.version || '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading application');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});