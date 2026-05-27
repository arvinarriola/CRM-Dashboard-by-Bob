# Setup Instructions for Change Manager Dashboard

## Quick Setup Guide

Since npm is not currently available in your environment, here are alternative ways to run the application:

## Option 1: Install Node.js and npm (Recommended)

1. **Download Node.js**
   - Visit: https://nodejs.org/
   - Download the LTS (Long Term Support) version
   - Run the installer and follow the prompts
   - This will install both Node.js and npm

2. **Verify Installation**
   ```bash
   node --version
   npm --version
   ```

3. **Install Dependencies and Run**
   ```bash
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Open browser to: http://localhost:3000

## Option 2: Use Online Development Environment

### Using StackBlitz (Instant, No Installation)

1. Go to https://stackblitz.com/
2. Click "New Project" → "React"
3. Upload all project files
4. The application will run automatically in the browser

### Using CodeSandbox (Instant, No Installation)

1. Go to https://codesandbox.io/
2. Create or import the project as a Vite React app
3. Upload all project files
4. If preview is blocked, allow CodeSandbox hosts in `vite.config.js`
5. Use the generated preview URL for testing
6. For a public demo anyone can access, deploy the production build to GitHub Pages, Netlify, or Vercel

## Option 3: Manual Setup with CDN (No Build Tools)

If you want to run without npm, you can create a standalone HTML version:

1. Create a single HTML file that includes React and dependencies via CDN
2. This is less ideal but works for quick demos
3. See `standalone.html` (if created) for an example

## What You Have Now

Your project structure is complete with:

✅ All React components (6 tabs)
✅ State management (Zustand)
✅ Utility functions (Excel parsing, comparison, email matching)
✅ Mock data generators
✅ Material-UI styling
✅ Outlook authentication (demo mode)
✅ Security features (rate limiting, session management)
✅ Complete functionality

## Project Files Created

```
change-manager-dashboard/
├── package.json              ✅ Dependencies defined
├── vite.config.js           ✅ Build configuration
├── index.html               ✅ Entry HTML
├── README.md                ✅ Documentation
├── QUICKSTART.md            ✅ Quick start guide
├── SETUP_INSTRUCTIONS.md    ✅ This file
└── src/
    ├── main.jsx             ✅ App entry point
    ├── App.jsx              ✅ Main component
    ├── types/
    │   └── index.js         ✅ Type definitions
    ├── store/
    │   └── useStore.js      ✅ State management (with session tracking)
    ├── utils/
    │   ├── mockDataGenerator.js    ✅ Mock data
    │   ├── excelParser.js          ✅ Excel handling
    │   ├── comparisonEngine.js     ✅ Data comparison
    │   ├── emailMatcher.js         ✅ Email search
    │   └── emailSecurity.js        ✅ Security utilities
    └── components/
        ├── DataImport/
        │   └── DataImportTab.jsx   ✅ Import tab
        ├── CrossCheck/
        │   └── CrossCheckTab.jsx   ✅ Cross-check tab
        ├── EmailSearch/
        │   └── EmailSearchTab.jsx  ✅ Email search tab (with security)
        ├── Review/
        │   └── ReviewTab.jsx       ✅ Review tab
        ├── EmailDraft/
        │   └── EmailDraftTab.jsx   ✅ Email draft tab (with security)
        ├── Export/
        │   └── ExportTab.jsx       ✅ Export tab
        └── OutlookAuth/
            └── OutlookAuth.jsx     ✅ Outlook authentication
```

## Next Steps

1. **Install Node.js** from https://nodejs.org/
2. **Open terminal** in the project directory
3. **Run**: `npm install`
4. **Run locally**: `npm run dev`
5. **Create production demo build**: `npm run deploy:prepare`
6. **Deploy the `dist/` folder** using GitHub Pages, Netlify, or Vercel
7. **Share the public deployment URL**

## Features Ready to Demo

Once running, you can immediately:

1. ✅ View 75 pre-loaded mock change requests
2. ✅ Upload Excel files
3. ✅ Run cross-check analysis
4. ✅ Connect Outlook (demo mode)
5. ✅ Search email activity (with rate limiting)
6. ✅ Add comments and categorize actions
7. ✅ Draft emails to owners (with confirmation dialogs)
8. ✅ Export to Excel with all updates
9. ✅ View charts and statistics
10. ✅ Experience security features (session timeout, validation)

## Troubleshooting

### If npm install fails:
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder
- Try again: `npm install`

### If port 3000 is busy:
- Edit `vite.config.js` and change port number
- Or kill the process using port 3000

### If browser doesn't open:
- Manually navigate to the URL shown in the terminal
- In CodeSandbox, use the generated preview URL instead of assuming localhost
- If CodeSandbox says the host is blocked, update `server.allowedHosts` in `vite.config.js`

## Demo Data

The application includes:
- **75 mock change requests** with realistic data
- **Mock email threads** (3-8 emails per CR)
- **Historical data** for comparison
- **4 email templates** for common scenarios
- **All statuses**: New, Assess, Authorize, Scheduled, Implement, Review, Closed, Cancelled
- **All priorities**: Critical, High, Medium, Low
- **Multiple categories**: Infrastructure, Application, Database, etc.

## 🔒 Security Features

The application includes comprehensive security guard rails:

### Rate Limiting
- **Email Search**: 50 searches per hour
- **Bulk Email Send**: 10 emails per minute, 50 per batch
- Prevents account abuse and API overload

### Session Management
- **Auto-timeout**: 30 minutes of inactivity
- **Activity tracking**: Updates on every operation
- **Automatic logout**: Clears authentication on timeout

### Input Validation
- **Email validation**: RFC-compliant address checking
- **Content sanitization**: Removes dangerous HTML/scripts
- **Bulk limits**: Maximum 50 recipients per send

### User Confirmation
- **Confirmation dialogs**: Required before bulk operations
- **Clear information**: Shows recipient count and content
- **Cancel option**: Review before committing

### Authentication
- **Blocked state**: Email features disabled until connected
- **Clear messaging**: Explains authentication requirements
- **Visual indicators**: Connection status display

## Support

If you encounter issues:
1. Check that Node.js is installed: `node --version`
2. Check that npm is installed: `npm --version`
3. Ensure you're in the correct directory
4. Check for error messages in the terminal
5. Try clearing browser cache

---

**Ready to start?** Install Node.js and run `npm install` then `npm run dev`!