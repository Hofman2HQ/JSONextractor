import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

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
let currentServer = null;
const sockets = new Set();

// Middleware
// Security headers
app.use(helmet());
// Content Security Policy (allow app + jsDelivr CDNs)
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      "font-src": ["'self'", "https://cdn.jsdelivr.net", "data:"],
      "img-src": ["'self'", "data:", "blob:"],
      "connect-src": [
        "'self'",
        "https://*.au10tixservices.com",
        "https://*.au10tixservicesstaging.com"
      ]
    }
  })
);
// Compression for static and API responses
app.use(compression());

// CORS (lock down unless explicitly allowed)
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : false;
app.use(cors({ origin: allowedOrigins }));

// Body parsing with limit
app.use(bodyParser.json({ limit: '10mb' })); // Add limit to prevent large payload attacks

// Basic rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Serve built assets first (bundled JS/CSS in public/dist) then fallback to raw public assets (favicon, etc.)
const distPath = path.join(__dirname, 'public', 'dist');
const publicPath = path.join(__dirname, 'public');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.use(express.static(publicPath));

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

// Serve the built index.html (with injected bundle script tags) for all other routes.
app.get('*', (req, res) => {
  const builtIndex = path.join(distPath, 'index.html');
  const sourceIndex = path.join(publicPath, 'index.html');
  try {
    if (fs.existsSync(builtIndex)) {
      return res.sendFile(builtIndex);
    }
    // Fallback to source template (useful before first build) - will not have scripts injected
    res.sendFile(sourceIndex);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading application');
  }
});

// Start server with optional auto-port fallback when in-use
function startServer(port) {
  const server = app.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`Server is running on port ${actualPort}`);
    console.log(`Health check available at http://localhost:${actualPort}/api/health`);
  });
  currentServer = server;
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
      if (process.env.AUTO_PORT === 'true') {
        console.log('AUTO_PORT is enabled. Trying an available port...');
        const fallback = app.listen(0, () => {
          const actualPort = fallback.address().port;
          console.log(`Server is running on port ${actualPort}`);
          console.log(`Health check available at http://localhost:${actualPort}/api/health`);
        });
        currentServer = fallback;
        fallback.on('connection', (socket) => {
          sockets.add(socket);
          socket.on('close', () => sockets.delete(socket));
        });
        fallback.on('error', (e2) => {
          console.error('Failed to bind to a dynamic port:', e2);
          process.exit(1);
        });
      } else {
        console.error('Set PORT to a free port or set AUTO_PORT=true to auto-select a free port.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);

// Graceful shutdown: close server and active sockets on termination signals
function gracefulShutdown(signal) {
  try {
    console.log(`${signal} received, shutting down gracefully`);
    if (currentServer) {
      // Stop accepting new connections
      currentServer.close((err) => {
        if (err) {
          console.error('Error during server close:', err);
        }
        // Destroy any open sockets
        sockets.forEach((s) => {
          try { s.destroy(); } catch {}
        });
        process.exit(0);
      });
      // Safety timeout
      setTimeout(() => {
        console.warn('Force exiting after timeout');
        sockets.forEach((s) => { try { s.destroy(); } catch {} });
        process.exit(0);
      }, 5000).unref();
    } else {
      process.exit(0);
    }
  } catch (e) {
    console.error('Error during graceful shutdown:', e);
    process.exit(1);
  }
}

['SIGINT', 'SIGTERM', 'SIGBREAK'].forEach((sig) => {
  try { process.on(sig, () => gracefulShutdown(sig)); } catch {}
});
