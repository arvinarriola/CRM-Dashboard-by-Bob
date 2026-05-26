import { create } from 'zustand';
import { generateMockChangeRequests, generateHistoricalChangeRequests, generateEmailTemplates, getAllMockEmails } from '../utils/mockDataGenerator';

/**
 * Global state management using Zustand
 */
const useStore = create((set, get) => ({
  // Data state
  changeRequests: [],
  historicalFiles: [],
  allEmails: [],
  emailTemplates: generateEmailTemplates(),
  
  // UI state
  currentTab: 0,
  loading: false,
  error: null,
  successMessage: null,
  
  // Comparison results
  comparisonResults: null,
  
  // Email search results
  emailSearchResults: {},
  
  // Filters
  filters: {
    status: [],
    priority: [],
    category: [],
    owner: [],
    showOutdatedOnly: false,
    showDuplicatesOnly: false,
    hasComments: undefined,
    contacted: undefined,
    searchText: ''
  },
  
  // Actions
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setSuccessMessage: (message) => set({ successMessage: message }),
  
  clearMessages: () => set({ error: null, successMessage: null }),
  
  // Initialize with mock data
  initializeMockData: () => {
    const mockRequests = generateMockChangeRequests(75);
    const historicalRequests = generateHistoricalChangeRequests(mockRequests);
    const emails = getAllMockEmails(mockRequests);
    
    set({
      changeRequests: mockRequests,
      historicalFiles: [{ name: 'Historical Data', data: historicalRequests }],
      allEmails: emails
    });
  },
  
  // Import change requests from Excel
  importChangeRequests: (requests, isPrimary = true) => {
    if (isPrimary) {
      set({ changeRequests: requests });
    } else {
      const historicalFiles = get().historicalFiles;
      historicalFiles.push({
        name: `Historical File ${historicalFiles.length + 1}`,
        data: requests
      });
      set({ historicalFiles });
    }
  },
  
  // Add historical file
  addHistoricalFile: (name, data) => {
    const historicalFiles = get().historicalFiles;
    historicalFiles.push({ name, data });
    set({ historicalFiles });
  },
  
  // Update a single change request
  updateChangeRequest: (id, updates) => {
    const changeRequests = get().changeRequests.map(cr =>
      cr.id === id ? { ...cr, ...updates } : cr
    );
    set({ changeRequests });
  },
  
  // Bulk update change requests
  bulkUpdateChangeRequests: (ids, updates) => {
    const changeRequests = get().changeRequests.map(cr =>
      ids.includes(cr.id) ? { ...cr, ...updates } : cr
    );
    set({ changeRequests });
  },
  
  // Update comment for a change request
  updateComment: (id, comment) => {
    get().updateChangeRequest(id, { comments: comment });
  },
  
  // Mark change request as contacted
  markAsContacted: (id) => {
    get().updateChangeRequest(id, {
      contacted: true,
      contactedDate: new Date()
    });
  },
  
  // Bulk mark as contacted
  bulkMarkAsContacted: (ids) => {
    get().bulkUpdateChangeRequests(ids, {
      contacted: true,
      contactedDate: new Date()
    });
  },
  
  // Set comparison results
  setComparisonResults: (results) => set({ comparisonResults: results }),
  
  // Set email search results
  setEmailSearchResults: (results) => set({ emailSearchResults: results }),
  
  // Update filters
  updateFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ filters });
  },
  
  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        status: [],
        priority: [],
        category: [],
        owner: [],
        showOutdatedOnly: false,
        showDuplicatesOnly: false,
        hasComments: undefined,
        contacted: undefined,
        searchText: ''
      }
    });
  },
  
  // Get filtered change requests
  getFilteredChangeRequests: () => {
    const { changeRequests, filters } = get();
    
    return changeRequests.filter(cr => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(cr.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(cr.priority)) {
        return false;
      }
      
      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(cr.category)) {
        return false;
      }
      
      // Owner filter
      if (filters.owner.length > 0 && !filters.owner.includes(cr.owner)) {
        return false;
      }
      
      // Outdated filter
      if (filters.showOutdatedOnly && !cr.isOutdated) {
        return false;
      }
      
      // Duplicate filter
      if (filters.showDuplicatesOnly && !cr.isDuplicate) {
        return false;
      }
      
      // Has comments filter
      if (filters.hasComments !== undefined) {
        const hasComments = cr.comments && cr.comments.trim().length > 0;
        if (filters.hasComments !== hasComments) {
          return false;
        }
      }
      
      // Contacted filter
      if (filters.contacted !== undefined && filters.contacted !== cr.contacted) {
        return false;
      }
      
      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch = 
          cr.changeNumber.toLowerCase().includes(searchLower) ||
          cr.title.toLowerCase().includes(searchLower) ||
          cr.description.toLowerCase().includes(searchLower) ||
          cr.owner.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }
      
      return true;
    });
  },
  
  // Get statistics
  getStatistics: () => {
    const changeRequests = get().changeRequests;
    
    const statusCounts = {};
    const priorityCounts = {};
    const categoryCounts = {};
    
    changeRequests.forEach(cr => {
      statusCounts[cr.status] = (statusCounts[cr.status] || 0) + 1;
      priorityCounts[cr.priority] = (priorityCounts[cr.priority] || 0) + 1;
      categoryCounts[cr.category] = (categoryCounts[cr.category] || 0) + 1;
    });
    
    return {
      total: changeRequests.length,
      statusCounts,
      priorityCounts,
      categoryCounts,
      outdated: changeRequests.filter(cr => cr.isOutdated).length,
      duplicates: changeRequests.filter(cr => cr.isDuplicate).length,
      withComments: changeRequests.filter(cr => cr.comments && cr.comments.trim().length > 0).length,
      contacted: changeRequests.filter(cr => cr.contacted).length,
      open: changeRequests.filter(cr => cr.status !== 'Closed' && cr.status !== 'Cancelled').length,
      closed: changeRequests.filter(cr => cr.status === 'Closed' || cr.status === 'Cancelled').length
    };
  },
  
  // Get unique values for filters
  getUniqueValues: () => {
    const changeRequests = get().changeRequests;
    
    const statuses = [...new Set(changeRequests.map(cr => cr.status))];
    const priorities = [...new Set(changeRequests.map(cr => cr.priority))];
    const categories = [...new Set(changeRequests.map(cr => cr.category))];
    const owners = [...new Set(changeRequests.map(cr => cr.owner))];
    
    return { statuses, priorities, categories, owners };
  },
  
  // Reset all data
  resetData: () => {
    set({
      changeRequests: [],
      historicalFiles: [],
      comparisonResults: null,
      emailSearchResults: {}
    });
  }
}));

export default useStore;

// Made with Bob
