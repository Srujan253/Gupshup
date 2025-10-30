# Email Setup Instructions for OTP Verification

## 🚨 Current Issue: Gmail Authentication Error

The error "Username and Password not accepted" suggests an issue with Gmail app password setup.

## 🔧 **Troubleshooting Steps:**

### Step 1: Verify Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Navigate to **Security** → **App passwords**
3. Delete the old app password
4. Generate a **NEW** app password for "Mail"
5. Copy the 16-character password (it will look like: `abcdabcdabcdabcd`)

### Step 2: Update .env File
Replace the EMAIL_PASS in your .env file with the new app password:
```
EMAIL_PASS=yournewapppasswordhere
```
**Important**: No spaces, no dashes, just the 16 characters

### Step 3: Alternative Gmail Settings
If app passwords don't work, try these Gmail settings:

#### Option A: Less Secure App Access (Not recommended)
1. Go to Google Account → Security
2. Turn on "Less secure app access"
3. Use your regular Gmail password

#### Option B: OAuth2 (More secure but complex)
```javascript
// Alternative OAuth2 configuration
auth: {
  type: 'OAuth2',
  user: 'ksrujan026@gmail.com',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  refreshToken: 'your-refresh-token'
}
```

### Step 4: Alternative Email Providers

#### Option C: Use Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Option D: Use Custom SMTP
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ksrujan026@gmail.com
EMAIL_PASS=your-app-password
```

## 🔐 **Current Configuration (in .env)**
```
EMAIL_SERVICE=gmail
EMAIL_USER=ksrujan026@gmail.com
EMAIL_PASS=khtzdhralzssnug
```

## ⚡ **Quick Fix Steps:**

1. **Generate New App Password:**
   - Go to Google Account → Security → App passwords
   - Create new password for "Mail"
   - Copy the 16-character code

2. **Update .env:**
   ```
   EMAIL_PASS=your16charactercode
   ```

3. **Restart Backend:**
   ```bash
   cd Backend
   npm run dev
   ```

4. **Test Signup:**
   - Fill signup form
   - Check console for detailed logs
   - Check email inbox

## 📧 **Alternative: Use Different Email Service**

If Gmail continues to cause issues, you can quickly switch to another email provider:

### Outlook Configuration:
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Configuration:
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-password
```

## 🐛 **Debugging Information**
The backend now logs:
- Email credentials (masked)
- SMTP connection details
- Detailed error messages

Check the console output when testing to see exactly what's happening.

---

**Next Steps:**
1. Try generating a fresh Gmail app password
2. If that fails, consider using Outlook or another email service
3. The OTP system will work with any email provider once authentication is fixed