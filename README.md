# Change Manager Dashboard

A comprehensive web application for managing ServiceNow change requests, designed to streamline the Change Manager workflow.

## 🎯 Overview

This application automates the time-consuming process of reviewing change requests by providing:

- **Data Import**: Upload Excel files or parse ServiceNow URLs
- **Cross-Check Analysis**: Compare current vs historical data to identify duplicates and outdated requests
- **Email Search**: Search mock Outlook emails for change request activity
- **Review & Comment**: Add observations and categorize actions for each change request
- **Email Draft**: Generate and send emails to change request owners
- **Export**: Generate comprehensive Excel reports with all updates

## ✨ Features

### 📥 Data Import
- Upload primary Excel files with change requests
- Upload multiple historical files for comparison
- Parse ServiceNow filter URLs (demo uses mock data)
- Preview imported data
- View statistics (total records, statuses, priorities)

### 🔍 Cross-Check Analysis
- Compare primary data against historical files
- Identify duplicate change requests
- Flag outdated requests (no updates in 30+ days)
- Track status changes over time
- Generate actionable recommendations

### 📧 Email Search
- Search individual change requests by number
- Bulk search all change requests for email activity
- View email threads with dates and participants
- Automatically generate observations based on email patterns
- Add observations directly to change request comments

### ✏️ Review & Comment
- Editable data grid with all change requests
- Add/edit comments for each entry
- Categorize actions: Cancel, Close, Future Release, Action Required
- Advanced filtering (status, priority, outdated, duplicates, etc.)
- Search by change number, title, or owner

### ✉️ Email Draft
- Select multiple change requests to contact
- Choose from pre-defined email templates
- Write custom emails
- Preview emails before sending
- Track contacted status
- Templates auto-fill change request details

### 📊 Finalize & Export
- View summary statistics and data visualizations
- Interactive charts (status distribution, priority breakdown, top categories)
- Filter data for export
- Export to Excel with all updates and comments
- Automatic summary sheet generation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd change-manager-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - The application will automatically open at `http://localhost:3000`
   - If not, manually navigate to the URL shown in the terminal

## 📖 How to Use

### Quick Start Demo

The application comes pre-loaded with **75 mock change requests** and sample email data for immediate demonstration.

1. **Data Import Tab**
   - View pre-loaded mock data
   - Upload your own Excel files (optional)
   - Preview data structure

2. **Cross-Check Tab**
   - Click "Run Comparison" to analyze data
   - Review duplicates and outdated requests
   - Check status changes

3. **Email Search Tab**
   - Click "Search All" to find email activity
   - View email threads for each change request
   - Add observations to comments

4. **Review & Comment Tab**
   - Click edit icon to add comments
   - Select action categories
   - Use filters to focus on specific requests

5. **Email Draft Tab**
   - Select change requests to contact
   - Choose an email template
   - Preview and send (simulated)

6. **Finalize & Export Tab**
   - Review statistics and charts
   - Select export filters
   - Click "Export to Excel" to download report

### Uploading Your Own Data

#### Excel File Format

Your Excel file should contain these columns (column names are flexible):

| Column | Description | Example |
|--------|-------------|---------|
| Change Number | Unique identifier | CHG0012345 |
| Title | Short description | Database Migration |
| Owner | Assigned person | John Smith |
| Owner Email | Contact email | john.smith@company.com |
| Status | Current status | Open, In Progress, Closed |
| Priority | Priority level | Critical, High, Medium, Low |
| Category | Change category | Infrastructure, Application |
| Created Date | Creation date | 2024-01-15 |
| Last Updated | Last update date | 2024-02-20 |
| Description | Detailed description | Full description text |

**Note**: The application automatically maps common column name variations.

## 🎨 Key Features Explained

### Mock Data
- **75 change requests** with varied statuses and priorities
- **Mock email threads** (3-8 emails per change request)
- **Historical data** for comparison testing
- **Pre-defined email templates** for common scenarios

### Email Templates
1. **Status Confirmation**: Request status updates for inactive requests
2. **Cancellation Request**: Propose cancellation for outdated requests
3. **Action Required**: Request completion of pending action items
4. **Future Release Planning**: Gather information for future releases

### Filters & Search
- Filter by status, priority, category, owner
- Show only outdated or duplicate requests
- Filter by comment status or contacted status
- Full-text search across change numbers, titles, and descriptions

### Data Visualization
- **Pie charts**: Status and priority distribution
- **Bar charts**: Top categories by volume
- **Statistics cards**: Key metrics at a glance
- **Color-coded indicators**: Visual status and priority identification

## 📁 Project Structure

```
change-manager-dashboard/
├── public/
│   └── sample-data/          # Sample Excel files
├── src/
│   ├── components/           # React components
│   │   ├── DataImport/
│   │   ├── CrossCheck/
│   │   ├── EmailSearch/
│   │   ├── Review/
│   │   ├── EmailDraft/
│   │   └── Export/
│   ├── utils/                # Utility functions
│   │   ├── mockDataGenerator.js
│   │   ├── excelParser.js
│   │   ├── comparisonEngine.js
│   │   └── emailMatcher.js
│   ├── store/                # State management
│   │   └── useStore.js
│   ├── types/                # Type definitions
│   │   └── index.js
│   ├── App.jsx               # Main application
│   └── main.jsx              # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Technology Stack

- **Frontend**: React 18 with Hooks
- **UI Library**: Material-UI (MUI)
- **Charts**: Recharts
- **State Management**: Zustand
- **Excel Processing**: SheetJS (xlsx)
- **Date Handling**: date-fns
- **Build Tool**: Vite

## 📊 Sample Workflow

### Typical Change Manager Process

1. **Import Data** (5 minutes)
   - Export change requests from ServiceNow
   - Upload to dashboard
   - Upload historical files for comparison

2. **Cross-Check** (10 minutes)
   - Run comparison analysis
   - Review duplicates and outdated items
   - Flag issues for follow-up

3. **Email Search** (15 minutes)
   - Search all change requests for email activity
   - Review communication patterns
   - Add observations to comments

4. **Review & Comment** (30 minutes)
   - Go through each change request
   - Add comments and observations
   - Categorize required actions

5. **Email Draft** (10 minutes)
   - Select requests needing owner contact
   - Generate emails from templates
   - Send communications

6. **Export Report** (5 minutes)
   - Review final statistics
   - Apply export filters
   - Download Excel report

**Total Time**: ~75 minutes (vs. several hours manually)

## 🎯 Benefits

- **Time Savings**: Reduce review time from hours to minutes
- **Consistency**: Standardized process and templates
- **Accuracy**: Automated cross-checking reduces errors
- **Tracking**: Built-in status tracking and history
- **Reporting**: Professional Excel reports with charts
- **Collaboration**: Easy to share and review data

## 🔧 Troubleshooting

### Application won't start
- Ensure Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check for port conflicts (default: 3000)

### Excel import fails
- Verify file format (.xlsx or .xls)
- Check that file contains data
- Ensure column headers are present

### Export not working
- Check browser's download settings
- Ensure pop-ups are not blocked
- Try a different browser

## 📝 Notes

- This is a **demo application** with simulated features
- Email sending is **simulated** (no actual emails sent)
- ServiceNow integration uses **mock data**
- All data is stored in **browser memory** (not persistent)

## 🚀 Future Enhancements

- Real ServiceNow API integration
- Actual Outlook/Exchange email integration
- Database persistence
- User authentication
- Multi-user collaboration
- Advanced analytics and reporting
- Mobile responsive design
- Dark mode theme

## 📄 License

This project is created for demonstration purposes.

## 👥 Support

For questions or issues, please refer to the documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Demo/Prototype