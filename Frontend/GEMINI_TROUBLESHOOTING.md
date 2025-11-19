# GupShup AI - Gemini API Troubleshooting

## Rate Limit Issues (429 Error)

If you're experiencing rate limit errors with Google Gemini API, here are solutions:

### 1. **Current Rate Limits**
- **15 seconds** minimum between requests
- **4 requests maximum** per minute
- These are conservative limits to stay well within Gemini's free tier

### 2. **If You Get Rate Limited**

The app has automatic retry with exponential backoff (will retry twice with 20s, 40s delays).

If you still get stuck, you can clear the rate limit data:

**Open browser console (F12) and run:**
```javascript
// Import and clear rate limit data
import { clearRateLimitData } from './src/lib/gemini.js';
clearRateLimitData();
```

**Or directly in console:**
```javascript
localStorage.removeItem('gupshup_last_request_time');
localStorage.removeItem('gupshup_request_times');
location.reload();
```

### 3. **Gemini Free Tier Limits**
- 15 requests per minute (RPM)
- 1,500 requests per day (RPD)
- 1 million tokens per day

### 4. **Best Practices**
- Wait 15-20 seconds between messages
- Avoid rapid-fire questions
- Keep messages concise to reduce token usage
- The UI will show a countdown timer when rate limited

### 5. **Production Considerations**

For production with many users, consider:

**Option A: Upgrade to Gemini Pro**
- Higher rate limits (60 RPM)
- More reliable for production
- Pay-as-you-go pricing

**Option B: Use OpenRouter**
- Aggregates multiple AI providers
- Better rate limit handling
- Automatic fallback

**Option C: Add Request Queue**
- Queue user requests server-side
- Process them with proper rate limiting
- Better UX for concurrent users

### 6. **Check API Key Status**

Verify your API key is valid:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

### 7. **Monitor Usage**

Check your Gemini API usage dashboard:
https://makersuite.google.com/app/apikey

---

## Need Help?

If issues persist:
1. Check the browser console for detailed error messages
2. Verify your `.env` file has the correct API key
3. Ensure you're not hitting daily quota limits
4. Try generating a new API key if the current one seems invalid
