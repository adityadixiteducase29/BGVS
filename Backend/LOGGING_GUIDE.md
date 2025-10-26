# Error Logging System

This backend application includes a comprehensive error logging system that automatically captures all errors and writes them to log files for debugging purposes, especially in production environments.

## Overview

The logging system creates three types of log files:

1. **Error Logs** (`error-YYYY-MM-DD.log`) - All caught errors with full context
2. **Info Logs** (`info-YYYY-MM-DD.log`) - General application info (server start, shutdown, etc.)
3. **Access Logs** (`access-YYYY-MM-DD.log`) - All API requests with response times

## Log File Structure

### Error Log Format
```json
{
  "timestamp": "2025-01-23T12:00:00.000Z",
  "error": {
    "message": "Error message here",
    "stack": "Full stack trace",
    "code": "ERROR_CODE",
    "statusCode": 500
  },
  "context": {
    "method": "POST",
    "url": "/api/users/login",
    "headers": {...},
    "body": {...},
    "params": {...},
    "query": {...},
    "userId": 123,
    "ip": "127.0.0.1"
  },
  "environment": {
    "nodeEnv": "production",
    "port": 3000
  }
}
```

### Access Log Format
```json
{
  "timestamp": "2025-01-23T12:00:00.000Z",
  "method": "GET",
  "url": "/api/companies",
  "statusCode": 200,
  "responseTime": "145ms",
  "ip": "127.0.0.1",
  "userId": 123
}
```

## Log Files Location

All log files are stored in the `Backend/logs/` directory:

```
Backend/
  logs/
    error-2025-01-23.log
    info-2025-01-23.log
    access-2025-01-23.log
```

## Automatic Features

1. **Daily Log Rotation** - New log files are created each day with the date in the filename
2. **Automatic Cleanup** - Log files older than 30 days are automatically deleted on server start
3. **Automatic Context Capture** - Every error log includes request headers, body, params, query, user info, and IP address
4. **Stack Traces** - Full error stack traces are captured for debugging

## Usage in Code

### Automatic Error Logging

All errors caught by the Express error handler are automatically logged. No additional code needed.

### Manual Error Logging

If you need to log errors manually in your code:

```javascript
const Logger = require('../utils/logger');

try {
    // Your code here
} catch (error) {
    Logger.logError(error, {
        req: req,
        res: res,
        customContext: 'additional info',
    });
    throw error; // Re-throw if needed
}
```

### Logging Info Messages

```javascript
const Logger = require('../utils/logger');

Logger.logInfo('User logged in successfully', {
    userId: user.id,
    email: user.email,
});
```

## Accessing Logs

### In Production (Render.com, Vercel, etc.)

If deployed on a platform:

1. **Render.com**: Use the Render dashboard to download logs or SSH into your service
2. **Vercel**: Check the "Functions" tab in your deployment for logs
3. **Local Development**: Check the `Backend/logs/` directory

### Via SSH/Command Line

```bash
# View today's error logs
tail -f Backend/logs/error-$(date +%Y-%m-%d).log

# View all error logs
cat Backend/logs/error-*.log

# Search for specific errors
grep "ERROR_CODE" Backend/logs/error-*.log

# View recent errors (last 50 lines)
tail -50 Backend/logs/error-$(date +%Y-%m-%d).log
```

### Reading Log Files

Since logs are in JSON format, you can use `jq` to parse them nicely:

```bash
# Pretty print the last error
tail -n 50 Backend/logs/error-$(date +%Y-%m-%d).log | jq .
```

## Troubleshooting Production Issues

### Example Workflow

1. **Identify the Error Time**: Check when the error occurred from your error tracking system
2. **Find the Log File**: Open `error-YYYY-MM-DD.log` for that date
3. **Search for the Error**: Look for the specific error message or stack trace
4. **Analyze Context**: Check the `context` object for request details, headers, body, user info
5. **Check Related Requests**: Look at `access-YYYY-MM-DD.log` to see the sequence of requests

### Common Scenarios

**Database Connection Errors**
```json
{
  "error": {
    "message": "connect ECONNREFUSED",
    "code": "ECONNREFUSED"
  }
}
```
Solution: Check database credentials in environment variables.

**Authentication Errors**
```json
{
  "error": {
    "message": "Invalid credentials"
  },
  "context": {
    "userId": "NOT_AUTHENTICATED"
  }
}
```
Solution: Check JWT configuration and authentication middleware.

**CORS Errors**
```json
{
  "error": {
    "message": "CORS policy violation"
  },
  "context": {
    "headers": {
      "origin": "https://your-frontend.com"
    }
}
```
Solution: Add the origin to CORS_ORIGIN environment variable.

## Log File Size Management

- Log files are rotated daily to prevent large files
- Old logs (30+ days) are automatically deleted
- Each log entry is on a separate line (JSON format)
- New entries are appended to the end of the file

## Security Considerations

- Log files may contain sensitive information (passwords, tokens, personal data)
- Never commit log files to version control (already in .gitignore)
- Delete logs containing sensitive data after debugging
- Set proper file permissions on the logs directory

## Disabling Logging

To disable file logging (for performance or other reasons):

Set environment variable:
```env
DISABLE_FILE_LOGGING=true
```

Then modify `logger.js` to check this variable before writing logs.

