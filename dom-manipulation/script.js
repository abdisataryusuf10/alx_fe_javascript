// Server simulation using JSONPlaceholder
const SERVER_BASE_URL = 'https://jsonplaceholder.typicode.com';
let serverQuotes = [];
let conflicts = [];
let syncInterval;
// STEP 1: Server Simulation - Add these functions
async function fetchQuotesFromServer() {
    try {
        console.log('Fetching quotes from server...');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // Use JSONPlaceholder as mock API
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=8');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        // Convert posts to our quote format
        const serverQuotes = posts.map(post => ({
            id: `server_${post.id}`,
            text: post.title.charAt(0).toUpperCase() + post.title.slice(1),
            author: `Author ${post.userId}`,
            category: ['Inspiration', 'Technology', 'Life', 'Wisdom'][post.userId % 4],
            timestamp: Date.now() - Math.floor(Math.random() * 100000000),
            source: 'server',
            version: 1
        }));
        
        console.log(`Fetched ${serverQuotes.length} quotes from server`);
        return serverQuotes;
        
    } catch (error) {
        console.error('Error fetching from server:', error);
        throw new Error('Failed to fetch quotes from server');
    }
}

async function postQuotesToServer(quotesToSync) {
    try {
        console.log('Posting quotes to server...');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
        
        // In a real application, this would be a POST request to your API
        // For simulation, we'll just log the data and return success
        console.log('Quotes to sync:', quotesToSync);
        
        // Simulate occasional server errors for testing
        if (Math.random() < 0.1) { // 10% chance of error
            throw new Error('Server temporarily unavailable');
        }
        
        return {
            success: true,
            message: 'Quotes synced successfully',
            syncedCount: quotesToSync.length,
            timestamp: Date.now()
        };
        
    } catch (error) {
        console.error('Error posting to server:', error);
        throw new Error('Failed to sync quotes with server');
    }
}
// DOM Elements - Add new ones
const syncNowBtn = document.getElementById('syncNowBtn');
const viewConflictsBtn = document.getElementById('viewConflictsBtn');
const lastSyncTime = document.getElementById('lastSyncTime');
const syncIndicator = document.getElementById('syncIndicator');
const syncStatusText = document.getElementById('syncStatusText');
const conflictResolution = document.getElementById('conflictResolution');
const conflictsList = document.getElementById('conflictsList');
const resolveAllServerBtn = document.getElementById('resolveAllServerBtn');
const resolveAllLocalBtn = document.getElementById('resolveAllLocalBtn');
const cancelResolutionBtn = document.getElementById('cancelResolutionBtn');
const notification = document.getElementById('notification');
const notificationTitle = document.getElementById('notificationTitle');
const notificationMessage = document.getElementById('notificationMessage');
const notificationActions = document.getElementById('notificationActions');

// Existing DOM elements and variables remain...

// STEP 1: Server Simulation
class ServerSimulator {
    static async fetchFromServer() {
        try {
            // Simulate fetching from server
            const response = await fetch(`${SERVER_BASE_URL}/posts?_limit=5`);
            const posts = await response.json();
            
            // Convert posts to quotes format
            return posts.map(post => ({
                id: `server_${post.id}`,
                text: post.title,
                author: `User ${post.userId}`,
                category: 'Server',
                timestamp: Date.now(),
                source: 'server'
            }));
        } catch (error) {
            console.error('Error fetching from server:', error);
            throw error;
        }
    }
    
    static async pushToServer(quotes) {
        try {
            // Simulate pushing to server with delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In a real app, you'd send quotes to the server
            // For simulation, we'll just store them locally
            serverQuotes = [...quotes];
            
            return { success: true, message: 'Data synced successfully' };
        } catch (error) {
            throw new Error('Failed to sync with server');
        }
    }
}

// STEP 2: Data Syncing Logic
class DataSync {
    static async syncWithServer() {
        updateSyncStatus('syncing', 'Syncing...');
        
        try {
            // Fetch latest from server
            const serverData = await ServerSimulator.fetchFromServer();
            
            // Merge server data with local data
            const mergedQuotes = this.mergeQuotes(quotes, serverData);
            
            // Detect conflicts
            conflicts = this.detectConflicts(quotes, serverData);
            
            // Update local storage
            if (conflicts.length === 0) {
                quotes = mergedQuotes;
                saveQuotes();
                showNotification('Sync Complete', 'Your quotes have been successfully synced with the server.', 'success');
            } else {
                showNotification(
                    'Sync Complete with Conflicts', 
                    `Found ${conflicts.length} conflicts that need resolution.`, 
                    'warning',
                    [
                        { text: 'Resolve Now', action: showConflictResolution, class: 'primary' },
                        { text: 'Later', action: hideNotification, class: 'secondary' }
                    ]
                );
            }
            
            // Update last sync time
            const now = new Date();
            lastSyncTime.textContent = `Last sync: ${now.toLocaleTimeString()}`;
            localStorage.setItem('lastSyncTime', now.toISOString());
            
            updateSyncStatus('online', 'Synced');
            
        } catch (error) {
            console.error('Sync failed:', error);
            updateSyncStatus('error', 'Sync Failed');
            showNotification('Sync Failed', 'Could not connect to server. Please try again.', 'error');
        }
    }
    
    static mergeQuotes(localQuotes, serverQuotes) {
        const merged = [...localQuotes];
        const localIds = new Set(localQuotes.map(q => q.id));
        
        serverQuotes.forEach(serverQuote => {
            if (!localIds.has(serverQuote.id)) {
                // New quote from server
                merged.push(serverQuote);
            } else {
                // Update existing quote (server takes precedence in auto-merge)
                const index = merged.findIndex(q => q.id === serverQuote.id);
                if (index !== -1) {
                    // Only update if server version is newer
                    if (serverQuote.timestamp > (merged[index].timestamp || 0)) {
                        merged[index] = { ...serverQuote, source: 'server' };
                    }
                }
            }
        });
        
        return merged;
    }
    // STEP 2: Data Syncing - Add this function
async function syncQuotes() {
    updateSyncStatus('syncing', 'Syncing with server...');
    
    try {
        // Fetch latest quotes from server
        const serverQuotes = await fetchQuotesFromServer();
        
        // Get local quotes that need to be synced (new or modified)
        const localQuotesToSync = quotes.filter(quote => 
            quote.source === 'local' || 
            (quote.lastSynced && quote.updatedAt > quote.lastSynced)
        );
        
        // Post local changes to server
        if (localQuotesToSync.length > 0) {
            await postQuotesToServer(localQuotesToSync);
            
            // Update lastSynced timestamp for synced quotes
            quotes.forEach(quote => {
                if (localQuotesToSync.find(q => q.id === quote.id)) {
                    quote.lastSynced = Date.now();
                }
            });
        }
        
        // Merge server quotes with local quotes
        const mergeResult = mergeQuotesWithServer(quotes, serverQuotes);
        quotes = mergeResult.mergedQuotes;
        conflicts = mergeResult.conflicts;
        
        // Save to local storage
        saveQuotes();
        
        // Update UI and show notifications
        updateSyncUI(mergeResult);
        
        updateSyncStatus('online', 'Sync complete');
        
    } catch (error) {
        console.error('Sync failed:', error);
        updateSyncStatus('error', 'Sync failed');
        showNotification('Sync Failed', error.message, 'error');
    }
}
// STEP 3: UI Updates - Add these functions
function updateSyncUI(mergeResult) {
    const { conflicts, newQuotesCount, updatedQuotesCount } = mergeResult;
    
    // Update last sync time
    const now = new Date();
    lastSyncTime.textContent = `Last sync: ${now.toLocaleTimeString()}`;
    localStorage.setItem('lastSyncTime', now.toISOString());
    
    // Show appropriate notification
    if (conflicts.length > 0) {
        showSyncNotificationWithConflicts(conflicts, newQuotesCount, updatedQuotesCount);
    } else if (newQuotesCount > 0 || updatedQuotesCount > 0) {
        showSyncSuccessNotification(newQuotesCount, updatedQuotesCount);
    } else {
        showNotification('Sync Complete', 'Your quotes are up to date with the server.', 'success');
    }
    
    // Update categories and display if needed
    if (newQuotesCount > 0) {
        populateCategories();
        if (currentFilter !== 'all') {
            displayFilteredQuotes();
        }
    }
}

function showSyncSuccessNotification(newQuotes, updatedQuotes) {
    let message = 'Sync completed successfully.';
    
    if (newQuotes > 0 && updatedQuotes > 0) {
        message = `Sync complete: ${newQuotes} new quotes added, ${updatedQuotes} quotes updated from server.`;
    } else if (newQuotes > 0) {
        message = `Sync complete: ${newQuotes} new quotes added from server.`;
    } else if (updatedQuotes > 0) {
        message = `Sync complete: ${updatedQuotes} quotes updated from server.`;
    }
    
    showNotification('Sync Successful', message, 'success', [
        {
            text: 'View Changes',
            action: () => {
                if (currentFilter === 'all') {
                    generateRandomQuote();
                }
                hideNotification();
            },
            class: 'primary'
        },
        {
            text: 'Dismiss',
            action: hideNotification,
            class: 'secondary'
        }
    ]);
}

function showSyncNotificationWithConflicts(conflicts, newQuotes, updatedQuotes) {
    let message = `Found ${conflicts.length} conflicts that need resolution.`;
    
    if (newQuotes > 0 || updatedQuotes > 0) {
        message += ` Also added ${newQuotes} new quotes and updated ${updatedQuotes} quotes.`;
    }
    
    showNotification('Sync Complete with Conflicts', message, 'warning', [
        {
            text: 'Resolve Conflicts',
            action: () => {
                showConflictResolution();
                hideNotification();
            },
            class: 'primary'
        },
        {
            text: 'View New Quotes',
            action: () => {
                if (currentFilter === 'all') {
                    generateRandomQuote();
                }
                hideNotification();
            },
            class: 'secondary'
        },
        {
            text: 'Dismiss',
            action: hideNotification,
            class: 'secondary'
        }
    ]);
}
function mergeQuotesWithServer(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    const conflicts = [];
    const serverQuoteMap = new Map(serverQuotes.map(q => [q.id, q]));
    
    // First pass: Update existing quotes and detect conflicts
    mergedQuotes.forEach((localQuote, index) => {
        const serverQuote = serverQuoteMap.get(localQuote.id);
        
        if (serverQuote) {
            // Quote exists on both sides - check for conflicts
            if (localQuote.text !== serverQuote.text || localQuote.author !== serverQuote.author) {
                // Conflict detected
                conflicts.push({
                    id: localQuote.id,
                    local: { ...localQuote },
                    server: { ...serverQuote },
                    type: 'content',
                    resolved: false
                });
                
                // For auto-resolution, server takes precedence
                if (serverQuote.timestamp > localQuote.timestamp) {
                    mergedQuotes[index] = { ...serverQuote, source: 'server' };
                }
            } else {
                // No conflict, update with server data if newer
                if (serverQuote.timestamp > localQuote.timestamp) {
                    mergedQuotes[index] = { ...serverQuote, source: 'server' };
                }
            }
            
            // Remove from map to track processed quotes
            serverQuoteMap.delete(localQuote.id);
        }
    });
    
    // Second pass: Add new quotes from server
    serverQuoteMap.forEach(serverQuote => {
        mergedQuotes.push({ ...serverQuote, source: 'server' });
    });
    
    return {
        mergedQuotes,
        conflicts,
        newQuotesCount: serverQuoteMap.size,
        updatedQuotesCount: serverQuotes.length - serverQuoteMap.size
    };
}
    static detectConflicts(localQuotes, serverQuotes) {
        const conflicts = [];
        
        serverQuotes.forEach(serverQuote => {
            const localQuote = localQuotes.find(q => q.id === serverQuote.id);
            
            if (localQuote) {
                // Simple conflict detection: different text or author
                if (localQuote.text !== serverQuote.text || localQuote.author !== serverQuote.author) {
                    conflicts.push({
                        id: serverQuote.id,
                        local: localQuote,
                        server: serverQuote,
                        type: 'content'
                    });
                }
            }
        });
        
        return conflicts;
    }
    
    static startPeriodicSync() {
        // Sync every 2 minutes
        syncInterval = setInterval(() => {
            DataSync.syncWithServer();
        }, 2 * 60 * 1000);
    }
    // STEP 2: Periodic Sync - Add these functions
function startPeriodicSync() {
    // Sync immediately on start
    syncQuotes();
    
    // Then sync every 30 seconds for demonstration
    // In production, this would be less frequent (e.g., every 5-10 minutes)
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            syncQuotes();
        }
    }, 30000); // 30 seconds
    
    console.log('Periodic sync started');
}

function stopPeriodicSync() {
    // Clear all intervals (in a real app, you'd track the interval ID)
    const intervalId = window.setInterval(function(){}, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < intervalId; i++) {
        window.clearInterval(i);
    }
    console.log('Periodic sync stopped');
}
    static stopPeriodicSync() {
        if (syncInterval) {
            clearInterval(syncInterval);
        }
    }
}

// STEP 3: Conflict Resolution
function showConflictResolution() {
    hideNotification();
    
    if (conflicts.length === 0) {
        showNotification('No Conflicts', 'All conflicts have been resolved.', 'success');
        return;
    }
    
    conflictsList.innerHTML = '';
    
    conflicts.forEach((conflict, index) => {
        const conflictItem = document.createElement('div');
        conflictItem.className = 'conflict-item';
        conflictItem.innerHTML = `
            <strong>Conflict ${index + 1}</strong>
            <div style="margin: 10px 0;">
                <div><strong>Local:</strong> "${conflict.local.text}" - ${conflict.local.author}</div>
                <div><strong>Server:</strong> "${conflict.server.text}" - ${conflict.server.author}</div>
            </div>
            <div class="conflict-actions">
                <button class="primary-btn resolve-single-btn" data-index="${index}" data-version="server">
                    Use Server Version
                </button>
                <button class="secondary-btn resolve-single-btn" data-index="${index}" data-version="local">
                    Use Local Version
                </button>
            </div>
        `;
        conflictsList.appendChild(conflictItem);
    });
    
    conflictResolution.style.display = 'block';
    
    // Add event listeners for single conflict resolution
    document.querySelectorAll('.resolve-single-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const version = this.dataset.version;
            resolveConflict(index, version);
        });
    });
}

function resolveConflict(index, version) {
    if (index >= 0 && index < conflicts.length) {
        const conflict = conflicts[index];
        
        if (version === 'server') {
            // Replace local with server version
            const quoteIndex = quotes.findIndex(q => q.id === conflict.id);
            if (quoteIndex !== -1) {
                quotes[quoteIndex] = { ...conflict.server, source: 'server' };
            }
        }
        // If version is 'local', we keep the local version, so no changes needed
        
        // Remove from conflicts
        conflicts.splice(index, 1);
        
        // Update UI
        showConflictResolution();
        
        if (conflicts.length === 0) {
            saveQuotes();
            conflictResolution.style.display = 'none';
            showNotification('Conflicts Resolved', 'All conflicts have been resolved and changes saved.', 'success');
        }
    }
}

function resolveAllConflicts(version) {
    conflicts.forEach((conflict, index) => {
        if (version === 'server') {
            const quoteIndex = quotes.findIndex(q => q.id === conflict.id);
            if (quoteIndex !== -1) {
                quotes[quoteIndex] = { ...conflict.server, source: 'server' };
            }
        }
    });
    
    conflicts = [];
    saveQuotes();
    conflictResolution.style.display = 'none';
    showNotification('All Conflicts Resolved', `All conflicts resolved using ${version} version.`, 'success');
}

// Notification System
function showNotification(title, message, type = 'info', actions = []) {
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // Set type
    notification.className = `notification ${type}`;
    
    // Clear previous actions
    notificationActions.innerHTML = '';
    
    // Add new actions
    actions.forEach(action => {
        const button = document.createElement('button');
        button.className = `notification-btn ${action.class}`;
        button.textContent = action.text;
        button.onclick = action.action;
        notificationActions.appendChild(button);
    });
    
    // Add close button if no actions
    if (actions.length === 0) {
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-btn secondary';
        closeButton.textContent = 'Close';
        closeButton.onclick = hideNotification;
        notificationActions.appendChild(closeButton);
    }
    
    notification.classList.add('show');
    
    // Auto-hide after 5 seconds if no actions
    if (actions.length === 0) {
        setTimeout(hideNotification, 5000);
    }
}

function hideNotification() {
    notification.classList.remove('show');
}

// Sync Status Management
function updateSyncStatus(status, text) {
    syncIndicator.className = `sync-indicator ${status}`;
    syncStatusText.textContent = text;
}

// Event Listeners - Add new ones
syncNowBtn.addEventListener('click', () => {
    DataSync.syncWithServer();
});

viewConflictsBtn.addEventListener('click', () => {
    if (conflicts.length > 0) {
        showConflictResolution();
    } else {
        showNotification('No Conflicts', 'There are no conflicts to resolve.', 'info');
    }
});

resolveAllServerBtn.addEventListener('click', () => {
    resolveAllConflicts('server');
});

resolveAllLocalBtn.addEventListener('click', () => {
    resolveAllConflicts('local');
});

cancelResolutionBtn.addEventListener('click', () => {
    conflictResolution.style.display = 'none';
});

// Initialize sync on page load
function initSync() {
    // Restore last sync time
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
        const time = new Date(lastSync);
        lastSyncTime.textContent = `Last sync: ${time.toLocaleTimeString()}`;
    }
    
    // Start periodic sync
    DataSync.startPeriodicSync();
    
    // Initial sync after 3 seconds
    setTimeout(() => {
        DataSync.syncWithServer();
    }, 3000);
}

// Update the existing initApp function
function initApp() {
    // Restore last selected category from local storage
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        categoryFilter.value = savedCategory;
    }
    // Update the existing initSync function
function initSync() {
    // Restore last sync time
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
        const time = new Date(lastSync);
        lastSyncTime.textContent = `Last sync: ${time.toLocaleTimeString()}`;
    }
    
    // Start periodic sync
    startPeriodicSync();
}

// Update the syncNowBtn event listener
syncNowBtn.addEventListener('click', () => {
    syncQuotes();
});

// Update the existing sync status function
function updateSyncStatus(status, text) {
    syncIndicator.className = `sync-indicator ${status}`;
    syncStatusText.textContent = text;
    
    // Add visual feedback for syncing state
    if (status === 'syncing') {
        syncNowBtn.disabled = true;
        syncNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    } else {
        syncNowBtn.disabled = false;
        syncNowBtn.innerHTML = '<i class="fas fa-sync"></i> Sync Now';
    }
}
    saveQuotes(); // Ensure initial quotes are saved to localStorage
    populateCategories(); // Populate categories dropdown
    
    // Apply the filter with the restored category
    filterQuotes();
    
    // Show a random quote on page load
    generateRandomQuote();
    
    // Initialize sync functionality
    initSync();
}

// Update quote structure to include IDs and timestamps
function addNewQuote() {
    const text = newQuoteText.value.trim();
    const author = newQuoteAuthor.value.trim();
    const category = newQuoteCategory.value.trim() || "Uncategorized";
    
    if (text && author) {
        const newQuote = { 
            text, 
            author, 
            category,
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            source: 'local'
        };
        quotes.push(newQuote);
        saveQuotes();
        
        // Update categories if this is a new category
        if (!categories.includes(category)) {
            populateCategories();
        }
        
        // Update displayed quotes if we're viewing a specific category
        if (currentFilter !== 'all') {
            displayFilteredQuotes();
        }
        
        // Reset form
        newQuoteText.value = '';
        newQuoteAuthor.value = '';
        newQuoteCategory.value = '';
        quoteForm.style.display = 'none';
        
        showNotification('Quote Added', 'Your quote has been saved locally and will be synced with the server.', 'success');
        
        // Display the new quote
        displayQuote(newQuote);
    } else {
        showNotification('Error', 'Please enter both quote text and author.', 'error');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
