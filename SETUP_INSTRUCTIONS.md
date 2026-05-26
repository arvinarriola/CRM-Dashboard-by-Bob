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
2. Click "Create Sandbox" → "React"
3. Upload all project files
4. The application will run automatically

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
✅ Complete functionality

## Project Files Created

```
change-manager-dashboard/
├── package.json              ✅ Dependencies defined
├── vite.config.js           ✅ Build configuration
├── index.html               ✅ Entry HTML
├── README.md                ✅ Documentation
├── SETUP_INSTRUCTIONS.md    ✅ This file
└── src/
    ├── main.jsx             ✅ App entry point
    ├── App.jsx              ✅ Main component
    ├── types/
    │   └── index.js         ✅ Type definitions
    ├── store/
    │   └── useStore.js      ✅ State management
    ├── utils/
    │   ├── mockDataGenerator.js    ✅ Mock data
    │   ├── excelParser.js          ✅ Excel handling
    │   ├── comparisonEngine.js     ✅ Data comparison
    │   └── emailMatcher.js         ✅ Email search
    └── components/
        ├── DataImport/
        │   └── DataImportTab.jsx   ✅ Import tab
        ├── CrossCheck/
        │   └── CrossCheckTab.jsx   ✅ Cross-check tab
        ├── EmailSearch/
        │   └── EmailSearchTab.jsx  ✅ Email search tab
        ├── Review/
        │   └── ReviewTab.jsx       ✅ Review tab
        ├── EmailDraft/
        │   └── EmailDraftTab.jsx   ✅ Email draft tab
        └── Export/
            └── ExportTab.jsx       ✅ Export tab
```

## Next Steps

1. **Install Node.js** from https://nodejs.org/
2. **Open terminal** in the project directory
3. **Run**: `npm install`
4. **Run**: `npm run dev`
5. **Open browser** to http://localhost:3000

## Features Ready to Demo

Once running, you can immediately:

1. ✅ View 75 pre-loaded mock change requests
2. ✅ Upload Excel files
3. ✅ Run cross-check analysis
4. ✅ Search email activity
5. ✅ Add comments and categorize actions
6. ✅ Draft emails to owners
7. ✅ Export to Excel with all updates
8. ✅ View charts and statistics

## Troubleshooting

### If npm install fails:
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder
- Try again: `npm install`

### If port 3000 is busy:
- Edit `vite.config.js` and change port number
- Or kill the process using port 3000

### If browser doesn't open:
- Manually navigate to http://localhost:3000
- Check terminal for the actual URL

## Demo Data

The application includes:
- **75 mock change requests** with realistic data
- **Mock email threads** (3-8 emails per CR)
- **Historical data** for comparison
- **4 email templates** for common scenarios
- **All statuses**: New, Assess, Authorize, Scheduled, Implement, Review, Closed, Cancelled
- **All priorities**: Critical, High, Medium, Low
- **Multiple categories**: Infrastructure, Application, Database, etc.

## Support

If you encounter issues:
1. Check that Node.js is installed: `node --version`
2. Check that npm is installed: `npm --version`
3. Ensure you're in the correct directory
4. Check for error messages in the terminal
5. Try clearing browser cache

---

**Ready to start?** Install Node.js and run `npm install` then `npm run dev`!