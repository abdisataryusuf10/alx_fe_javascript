// Global variables
let quotes = [];
let autoSyncInterval = null;
let isAutoSyncEnabled = false;
const SYNC_INTERVAL = 30000; // 30 seconds

// ============================================================================
// STEP 1: Server Simulation Setup
// ============================================================================

// Mock server URL (using JSONPlaceholder simulation)
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Simulated server storage
class MockServer {
    constructor() {
        this.serverData = this.loadServerData();
    }

    loadServerData() {
        const stored = localStorage.getItem('mockServerData');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Initial server data
        const initialData = [
            {
                id: 1,
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                category: "Motivation",
                timestamp: Date.now() - 86400000,
                version: 1
            },
            {
                id: 2,
                text: "Innovation distinguishes between a leader and a follower.",
                author: "Steve Jobs",
                category: "Leadership",
                timestamp: Date.now() - 86400000,
                version: 1
            }
        ];
        this.saveServerData(initialData);
        return initialData;
    }

    saveServerData(data) {
        localStorage.setItem('mockServerData', JSON.stringify(data));
        this.serverData = data;
    }

    // Simulate API delay
    async simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    }

    // Fetch quotes from server
    async fetchQuotes() {
        await this.simulateDelay();
        return [...this.serverData];
    }

    // Post quotes to server
    async postQuotes(quotesToSync) {
        await this.simulateDelay();
        
        const updatedData = [...this.serverData];
        let conflicts = [];

        quotesToSync.forEach(localQuote => {
            const existingIndex = updatedData.findIndex(serverQuote => 
                serverQuote.id === localQuote.id
            );

            if (existingIndex !== -1) {
                // Check for conflicts (server version is newer)
                const serverQuote = updatedData[existingIndex];
                if (serverQuote.timestamp > localQuote.timestamp) {
                    conflicts.push({
                        local: localQuote,
                        server: serverQuote,
                        type: 'update'
                    });
                    // Server takes precedence
                    return;
                }
                // Update existing quote
                updatedData[existingIndex] = {
                    ...localQuote,
                    timestamp: Date.now(),
                    version: serverQuote.version + 1
                };
            } else {
                // Add new quote
                const newId = Math.max(...updatedData.map(q => q.id), 0) + 1;
                updatedData.push({
                    ...localQuote,
                    id: newId,
                    timestamp: Date.now(),
                    version: 1
                });
            }
        });

        this.saveServerData(updatedData);
        return { success: true, conflicts, data: updatedData };
    }
}

const mockServer = new MockServer();

// ============================================================================
// Application Initialization
// ============================================================================

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadQuotesFromStorage();
    setupEventListeners();
    populateCategories();
    displayQuotes();
    restoreLastFilter();
    updateSyncStatus('Application initialized');
}

// Set up event listeners
function setupEventListeners() {
    const categoryFilter = document.getElementById('categoryFilter');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    
    categoryFilter.addEventListener('change', filterQuotes);
    addQuoteBtn.addEventListener('click', addQuote);
}

// Load quotes from localStorage or initialize with sample data
function loadQuotesFromStorage() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Initialize with server data if no quotes exist in storage
        syncFromServer();
    }
}

// Save quotes to localStorage
function saveQuotesToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    // Also update last modified timestamp
    localStorage.setItem('lastModified', Date.now().toString());
}

// ============================================================================
// STEP 2: Data Syncing Logic
// ============================================================================

// Sync data from server to client
async function syncFromServer() {
    try {
        showNotification('Syncing data from server...', 'sync');
        const serverQuotes = await mockServer.fetchQuotes();
        
        let conflicts = [];
        let updates = 0;

        serverQuotes.forEach(serverQuote => {
            const localIndex = quotes.findIndex(localQuote => 
                localQuote.id === serverQuote.id
            );

            if (localIndex !== -1) {
                // Quote exists locally - check for conflicts
                const localQuote = quotes[localIndex];
                if (serverQuote.timestamp > localQuote.timestamp) {
                    conflicts.push({
                        local: localQuote,
                        server: serverQuote,
                        type: 'update'
                    });
                    // Server takes precedence
                    quotes[localIndex] = { ...serverQuote };
                    updates++;
                }
            } else {
                // New quote from server
                quotes.push(serverQuote);
                updates++;
            }
        });

        saveQuotesToStorage();
        populateCategories();
        displayQuotes();

        if (conflicts.length > 0) {
            showNotification(`${conflicts.length} conflicts detected during sync`, 'conflict');
            handleConflicts(conflicts);
        }

        if (updates > 0) {
            showNotification(`Updated ${updates} quotes from server`, 'sync');
        }

        updateSyncStatus(`Last sync: ${new Date().toLocaleTimeString()} (${updates} updates)`);
        
    } catch (error) {
        console.error('Sync from server failed:', error);
        showNotification('Sync failed: ' + error.message, 'error');
    }
}

// Sync data from client to server
async function syncToServer() {
    try {
        showNotification('Syncing data to server...', 'sync');
        
        // Add metadata to local quotes for sync
        const quotesToSync = quotes.map(quote => ({
            ...quote,
            timestamp: quote.timestamp || Date.now(),
            version: quote.version || 1
        }));

        const result = await mockServer.postQuotes(quotesToSync);
        
        if (result.conflicts && result.conflicts.length > 0) {
            showNotification(`${result.conflicts.length} conflicts detected`, 'conflict');
            handleConflicts(result.conflicts);
        }

        // Update local data with server response
        quotes = result.data.map(quote => ({ ...quote }));
        saveQuotesToStorage();
        populateCategories();
        displayQuotes();

        updateSyncStatus(`Last sync: ${new Date().toLocaleTimeString()} (server updated)`);
        showNotification('Sync completed successfully', 'sync');
        
    } catch (error) {
        console.error('Sync to server failed:', error);
        showNotification('Sync failed: ' + error.message, 'error');
    }
}

// Manual sync trigger
async function manualSync() {
    await syncToServer();
    await syncFromServer();
}

// Auto-sync functionality
function toggleAutoSync() {
    const button = document.getElementById('autoSyncBtn');
    
    if (isAutoSyncEnabled) {
        clearInterval(autoSyncInterval);
        isAutoSyncEnabled = false;
        button.textContent = 'Enable Auto Sync (30s)';
        button.style.backgroundColor = '#007bff';
        showNotification('Auto sync disabled', 'sync');
    } else {
        autoSyncInterval = setInterval(manualSync, SYNC_INTERVAL);
        isAutoSyncEnabled = true;
        button.textContent = 'Disable Auto Sync';
        button.style.backgroundColor = '#dc3545';
        showNotification('Auto sync enabled - syncing every 30 seconds', 'sync');
        manualSync(); // Do initial sync
    }
}

// ============================================================================
// STEP 3: Conflict Resolution
// ============================================================================

function handleConflicts(conflicts) {
    const conflictArea = document.getElementById('conflictResolutionArea');
    
    if (conflicts.length === 0) {
        conflictArea.style.display = 'none';
        return;
    }

    let conflictHTML = `
        <div class="conflict-resolution">
            <h3>Data Conflicts Detected (${conflicts.length})</h3>
            <p>The following quotes have been modified on both server and client:</p>
    `;

    conflicts.forEach((conflict, index) => {
        conflictHTML += `
            <div class="conflict-option">
                <h4>Conflict ${index + 1}: ${conflict.local.text.substring(0, 50)}...</h4>
                <div style="display: flex; justify-content: space-between; gap: 10px;">
                    <div style="flex: 1;">
                        <strong>Server Version:</strong><br>
                        "${conflict.server.text}"<br>
                        - ${conflict.server.author}<br>
                        <em>${conflict.server.category}</em><br>
                        <small>Updated: ${new Date(conflict.server.timestamp).toLocaleString()}</small>
                    </div>
                    <div style="flex: 1;">
                        <strong>Local Version:</strong><br>
                        "${conflict.local.text}"<br>
                        - ${conflict.local.author}<br>
                        <em>${conflict.local.category}</em><br>
                        <small>Updated: ${new Date(conflict.local.timestamp).toLocaleString()}</small>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <button onclick="resolveConflict(${index}, 'server')" style="background-color: #28a745;">Use Server Version</button>
                    <button onclick="resolveConflict(${index}, 'local')" style="background-color: #007bff;">Use Local Version</button>
                    <button onclick="resolveConflict(${index}, 'keep-both')" style="background-color: #6c757d;">Keep Both</button>
                </div>
            </div>
        `;
    });

    conflictHTML += `
            <div style="margin-top: 15px;">
                <button onclick="resolveAllConflicts('server')" style="background-color: #28a745;">Use All Server Versions</button>
                <button onclick="resolveAllConflicts('local')" style="background-color: #007bff;">Use All Local Versions</button>
            </div>
        </div>
    `;

    conflictArea.innerHTML = conflictHTML;
    conflictArea.style.display = 'block';
}

function resolveConflict(conflictIndex, resolution) {
    const conflicts = JSON.parse(localStorage.getItem('pendingConflicts') || '[]');
    
    if (conflictIndex >= conflicts.length) return;

    const conflict = conflicts[conflictIndex];
    
    switch (resolution) {
        case 'server':
            // Replace local with server version
            const localIndex = quotes.findIndex(q => q.id === conflict.local.id);
            if (localIndex !== -1) {
                quotes[localIndex] = { ...conflict.server };
            }
            break;
        case 'local':
            // Keep local version (will be sent to server on next sync)
            // No action needed as local version is already in quotes array
            break;
        case 'keep-both':
            // Keep both versions by modifying the local one slightly
            const newQuote = {
                ...conflict.local,
                id: Math.max(...quotes.map(q => q.id), 0) + 1,
                text: conflict.local.text + " (Local Copy)",
                timestamp: Date.now()
            };
            quotes.push(newQuote);
            break;
    }

    // Remove resolved conflict
    conflicts.splice(conflictIndex, 1);
    localStorage.setItem('pendingConflicts', JSON.stringify(conflicts));
    
    saveQuotesToStorage();
    populateCategories();
    displayQuotes();
    
    if (conflicts.length === 0) {
        document.getElementById('conflictResolutionArea').style.display = 'none';
        showNotification('All conflicts resolved', 'sync');
    } else {
        handleConflicts(conflicts);
    }
}

function resolveAllConflicts(resolution) {
    const conflicts = JSON.parse(localStorage.getItem('pendingConflicts') || '[]');
    
    conflicts.forEach(conflict => {
        const localIndex = quotes.findIndex(q => q.id === conflict.local.id);
        
        if (resolution === 'server' && localIndex !== -1) {
            quotes[localIndex] = { ...conflict.server };
        }
        // For 'local' resolution, no action needed as local versions are already kept
    });

    localStorage.removeItem('pendingConflicts');
    document.getElementById('conflictResolutionArea').style.display = 'none';
    saveQuotesToStorage();
    populateCategories();
    displayQuotes();
    showNotification(`All conflicts resolved using ${resolution} versions`, 'sync');
}

// ============================================================================
// UI Helper Functions
// ============================================================================

function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = `notification ${type}-notification`;
    notification.textContent = message;
    
    notificationArea.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function updateSyncStatus(message) {
    const syncStatus = document.getElementById('syncStatus');
    syncStatus.textContent = message;
    localStorage.setItem('lastSyncStatus', message);
}

// ============================================================================
// Existing Quote Management Functions (Updated)
// ============================================================================

function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const currentSelection = categoryFilter.value;
    
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }

    const categories = [...new Set(quotes.map(quote => quote.category))].sort();
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    if (currentSelection && categories.includes(currentSelection)) {
        categoryFilter.value = currentSelection;
    }
}

function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    
    localStorage.setItem('lastSelectedFilter', selectedCategory);
    displayQuotes(selectedCategory);
}

function displayQuotes(filterCategory = null) {
    const quotesContainer = document.getElementById('quotesContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    
    const selectedCategory = filterCategory || categoryFilter.value;
    quotesContainer.innerHTML = '';

    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quotesContainer.innerHTML = '<div class="quote-card"><p>No quotes found for the selected category.</p></div>';
        return;
    }

    filteredQuotes.forEach((quote, index) => {
        const originalIndex = quotes.findIndex(q => 
            q.text === quote.text && q.author === quote.author && q.category === quote.category
        );
        
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-card';
        quoteElement.innerHTML = `
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">- ${quote.author}
                <span class="quote-category">${quote.category}</span>
            </div>
            <small>Last updated: ${new Date(quote.timestamp || Date.now()).toLocaleString()}</small>
            <br>
            <button class="delete-btn" onclick="deleteQuote(${originalIndex})">Delete</button>
        `;
        quotesContainer.appendChild(quoteElement);
    });
}

function restoreLastFilter() {
    const lastFilter = localStorage.getItem('lastSelectedFilter');
    if (lastFilter) {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = [...new Set(quotes.map(quote => quote.category))];
        if (lastFilter === 'all' || categories.includes(lastFilter)) {
            categoryFilter.value = lastFilter;
            displayQuotes(lastFilter);
        }
    }
}

function addQuote() {
    const quoteText = document.getElementById('quoteText').value.trim();
    const quoteAuthor = document.getElementById('quoteAuthor').value.trim();
    const quoteCategory = document.getElementById('quoteCategory').value.trim();

    if (!quoteText || !quoteAuthor || !quoteCategory) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    const newQuote = {
        id: Math.max(...quotes.map(q => q.id || 0), 0) + 1,
        text: quoteText,
        author: quoteAuthor,
        category: quoteCategory,
        timestamp: Date.now(),
        version: 1
    };

    quotes.push(newQuote);
    saveQuotesToStorage();
    
    const categories = [...new Set(quotes.map(quote => quote.category))];
    const categoryExists = categories.includes(quoteCategory);
    
    if (!categoryExists) {
        populateCategories();
    }

    document.getElementById('quoteText').value = '';
    document.getElementById('quoteAuthor').value = '';
    document.getElementById('quoteCategory').value = '';

    const currentFilter = document.getElementById('categoryFilter').value;
    displayQuotes(currentFilter);
    
    showNotification('Quote added successfully! Local changes will be synced on next sync.', 'sync');
}

function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        const deletedCategory = quotes[index].category;
        quotes.splice(index, 1);
        saveQuotesToStorage();
        
        const remainingQuotesInCategory = quotes.filter(quote => quote.category === deletedCategory);
        populateCategories();
        
        const currentFilter = document.getElementById('categoryFilter').value;
        if (currentFilter === deletedCategory && remainingQuotesInCategory.length === 0) {
            document.getElementById('categoryFilter').value = 'all';
            displayQuotes('all');
            localStorage.setItem('lastSelectedFilter', 'all');
        } else {
            displayQuotes(currentFilter);
        }
        
        showNotification('Quote deleted. Local changes will be synced on next sync.', 'sync');
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This will remove all quotes and reset to sample data.')) {
        localStorage.clear();
        loadQuotesFromStorage();
        populateCategories();
        document.getElementById('categoryFilter').value = 'all';
        displayQuotes('all');
        localStorage.setItem('lastSelectedFilter', 'all');
        showNotification('All data has been cleared and reset to sample quotes.', 'sync');
    }
}
