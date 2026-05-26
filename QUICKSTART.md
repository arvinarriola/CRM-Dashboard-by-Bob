# 🚀 Quick Start Guide

## Get the App Running in 3 Steps

### Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Follow the installation wizard (use default settings)
5. Restart your terminal/command prompt

**Verify installation:**
```bash
node --version
npm --version
```

You should see version numbers like:
```
v18.x.x
9.x.x
```

### Step 2: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will download all required packages (~2-3 minutes).

### Step 3: Start the Application

```bash
npm run dev
```

The app will start and automatically open in your browser at:
```
http://localhost:3000
```

If it doesn't open automatically, just copy that URL into your browser.

## 🎉 You're Done!

The application is now running with:
- ✅ 75 pre-loaded mock change requests
- ✅ Mock email data
- ✅ All 6 tabs fully functional
- ✅ Outlook authentication (demo mode)
- ✅ Security features enabled
- ✅ Ready for immediate demo

## 📱 Using the App

### Quick Demo Flow:

1. **Data Import Tab** - View pre-loaded data (already there!)
2. **Cross-Check Tab** - Click "Run Comparison" button
3. **Email Search Tab** - Click "Connect Outlook" (demo mode), then "Search All"
4. **Review & Comment Tab** - Click edit icon to add comments
5. **Email Draft Tab** - Connect Outlook, select requests, choose template
6. **Finalize & Export Tab** - Click "Export to Excel" button

### 🔒 Security Features

The app includes built-in security protection:
- **Rate Limiting**: Prevents email abuse (50 searches/hour, 10 sends/minute)
- **Session Timeout**: Auto-logout after 30 minutes of inactivity
- **Confirmation Dialogs**: Required before bulk email operations
- **Input Validation**: Email addresses and content are validated
- **Authentication**: Email features require Outlook connection

##  Stopping the App

Press `Ctrl + C` in the terminal to stop the development server.

## ❓ Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Solution: Install Node.js from nodejs.org

### Port 3000 already in use
- Another app is using port 3000
- Solution: Stop other apps or change port in `vite.config.js`

### Installation errors
- Try: `npm cache clean --force`
- Then: `npm install` again

## 📞 Need Help?

Check the full documentation in `README.md` or `SETUP_INSTRUCTIONS.md`

---

**That's it! Enjoy your Change Manager Dashboard! 🎊**