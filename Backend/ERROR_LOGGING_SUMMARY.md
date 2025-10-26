# Error Logging System - Summary

## What Was Added

A comprehensive error logging system that automatically captures and stores all errors to files for production debugging.

## Files Created

1. **`Backend/src/utils/logger.js`** - Core logging utility
2. **`Backend/src/middleware/errorHandler.js`** - Helper for async error handling
3. **`Backend/logs/README.md`** - Guide for accessing logs
4. **`Backend/LOGGING_GUIDE.md`** - Complete documentation

## Files Modified

1. **`Backend/src/app.js`** - Integrated logger
2. **`Backend/.gitignore`** - Exclude logs directory

## How It Works

### Automatic Error Logging

All errors caught by Express are automatically logged to:
```
Backend/logs/error-YYYY-MM-DD.log
```

Each error log includes:
- Full error message and stack trace
- HTTP method and URL
- Request headers, body, params, query
- User information
- IP address
- Timestamp

### Log Files

Three types of logs are created:

1. **Error Logs** (`error-YYYY-MM-DD.log`)
   - All errors with complete context
   - Full stack traces
   - Request details

2. **Info Logs** (`info-YYYY-MM-DD.log`)
   - Server startup/shutdown
   - General application events

3. **Access Logs** (`access-YYYY-MM-DD.log`)
   - All API requests
   - Response status codes
   - Response times
   - User IDs and IPs

## Accessing Logs

### On Render.com (Production)

1. Go to Render dashboard
2. Click on your backend service
3. Click "Logs" tab
4. Scroll to find errors
5. Or use CLI: `render logs <service-name>`

### On Vercel (Production)

1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Click "Functions" and find your API route
6. Check the logs section

### Locally

```bash
# View today's errors
tail -f Backend/logs/error-$(date +%Y-%m-%d).log

# View all errors
cat Backend/logs/error-*.log | less

# Search for specific errors
grep "Error message" Backend/logs/error-*.log
```

## Example Error Log Entry

```json
{
  "timestamp": "2025-01-23T12:34:56.789Z",
  "error": {
    "message": "Failed to create application",
    "stack": "Error: Failed to create application\n    at ApplicationController.createApplication...",
    "code": "E500",
    "statusCode": 500
  },
  "context": {
    "method": "POST",
    "url": "/api/applications/companies/7",
    "headers": {
      "authorization": "Bearer ...",
      "content-type": "application/json"
    },
    "body": {
      "applicant_first_name": "John",
      "applicant_last_name": "Doe"
    },
    "params": {
      "companyId": "7"
    },
    "query": {},
    "userId": 6,
    "ip": "127.0.0.1"
  },
  "environment": {
    "nodeEnv": "production",
    "port": 3000
  }
}
```

## Debugging Process

### When an API fails in production:

1. **Get the error timestamp** from your error tracking system
2. **Open the log file** for that date: `error-YYYY-MM-DD.log`
3. **Search for the error message** or use the timestamp
4. **Analyze the context**:
   - What endpoint was called?
   - What data was sent?
   - What user made the request?
   - What headers were present?
5. **Check related requests** in `access-YYYY-MM-DD.log` to see the sequence
6. **Fix the issue** based on the error details

## Features

✅ Automatic error logging
✅ Daily log rotation
✅ Automatic cleanup (30 days)
✅ Full request context
✅ Stack traces preserved
✅ User and IP tracking
✅ Production-ready
✅ JSON format for easy parsing

## Testing

To test the logging system:

1. Make a request that causes an error
2. Check `Backend/logs/error-YYYY-MM-DD.log`
3. Verify the error is logged with full context

## Next Steps

1. Deploy your changes to production
2. Monitor the logs when issues occur
3. Use the logs to debug production errors
4. Check `Backend/logs/README.md` for detailed debugging guide

