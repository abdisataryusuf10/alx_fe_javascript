// ... existing code ...

// Initialize the application
function init() {
    // Load last viewed quote from session storage
    const lastViewedQuote = getFromSessionStorage('lastViewedQuote');
    if (lastViewedQuote) {
        quoteTextElement.textContent = `"${lastViewedQuote.text}"`;
        quoteCategoryElement.textContent = lastViewedQuote.category;
    } else {
        showRandomQuote();
    }
    
    // Load user preferences from session storage
    const userPreferences = getFromSessionStorage('userPreferences') || {};
    if (userPreferences.selectedCategory) {
        categorySelector.value = userPreferences.selectedCategory;
    }
    
    // Populate category selector
    updateCategorySelector();
    
    // Display all quotes
    displayAllQuotes();
    
    // Update statistics
    updateStatistics();
    
    // Update storage usage
    updateStorageUsage();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    categorySelector.addEventListener('change', function() {
        filterQuotesByCategory();
        // Save preference to session storage
        const preferences = getFromSessionStorage('userPreferences') || {};
        preferences.selectedCategory = this.value;
        saveToSessionStorage('userPreferences', preferences);
    });
    
    // Event listeners for export functionality
    document.getElementById('exportJSON').addEventListener('click', exportAsJSON);
    document.getElementById('exportCSV').addEventListener('click', exportAsCSV);
    document.getElementById('exportToJsonFile').addEventListener('click', exportToJsonFile);
    document.getElementById('processImport').addEventListener('click', importFromJson);
    
    // Event listener for file import
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);
    
    // Initialize favorites
    displayFavorites();
    
    console.log('Application initialized with', quotes.length, 'quotes from localStorage');
}

// ... existing functions ...

// Section 1: Export Quotes Button - Enhanced exportAsJSON function
function exportAsJSON() {
    try {
        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        
        const linkElement = document.createElement('a');
        linkElement.href = dataUrl;
        linkElement.download = `quotes-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
        
        // Show success message with details
        showNotification(`Successfully exported ${quotes.length} quotes to JSON file!`, 'success');
        
        console.log('JSON export completed:', quotes.length, 'quotes exported');
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Error exporting quotes: ' + error.message, 'error');
    }
}

// Section 2: Export to JSON File Function
function exportToJsonFile() {
    try {
        // Validate data before export
        if (!quotes || quotes.length === 0) {
            showNotification('No quotes available to export!', 'warning');
            return;
        }

        // Create structured data with metadata
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                totalQuotes: quotes.length,
                categories: [...new Set(quotes.map(quote => quote.category))]
            },
            quotes: quotes
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        
        const linkElement = document.createElement('a');
        linkElement.href = dataUrl;
        linkElement.download = `quotes-backup-${new Date().toISOString().split('T')[0]}.json`;
        linkElement.style.display = 'none';
        
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
        
        // Show detailed success message
        const categoryCount = new Set(quotes.map(quote => quote.category)).size;
        showNotification(
            `Exported ${quotes.length} quotes across ${categoryCount} categories successfully!`, 
            'success'
        );
        
        console.log('Enhanced JSON export completed:', exportData.metadata);
        
    } catch (error) {
        console.error('Enhanced export error:', error);
        showNotification('Error exporting quotes: ' + error.message, 'error');
    }
}

// Section 3 & 4: Import from JSON File Function
function importFromJsonFile(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showNotification('Please select a valid JSON file.', 'error');
        event.target.value = ''; // Reset file input
        return;
    }
    
    // Show loading state
    const importButton = event.target;
    const originalText = importButton.value;
    importButton.disabled = true;
    importButton.value = 'Importing...';
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            let importedQuotes = [];
            
            // Handle different JSON structures
            if (Array.isArray(importedData)) {
                // Simple array of quotes
                importedQuotes = importedData;
            } else if (importedData.quotes && Array.isArray(importedData.quotes)) {
                // Structured export with metadata
                importedQuotes = importedData.quotes;
                showNotification(
                    `Importing from backup: ${importedData.metadata?.totalQuotes || importedQuotes.length} quotes found`, 
                    'info'
                );
            } else {
                throw new Error('Invalid JSON structure. Expected array of quotes or structured export format.');
            }
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data must contain an array of quotes');
            }
            
            // Validate each quote has required fields
            const validQuotes = importedQuotes.filter((quote, index) => {
                if (!quote.text || !quote.category) {
                    console.warn(`Skipping invalid quote at index ${index}:`, quote);
                    return false;
                }
                return true;
            });
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the imported file');
            }
            
            // Check for duplicates
            const newQuotes = validQuotes.filter(importedQuote => {
                return !quotes.some(existingQuote => 
                    existingQuote.text === importedQuote.text && 
                    existingQuote.category === importedQuote.category
                );
            });
            
            const duplicateCount = validQuotes.length - newQuotes.length;
            
            // Add imported quotes to existing quotes with new IDs
            newQuotes.forEach(quote => {
                quotes.push({
                    text: quote.text.trim(),
                    category: quote.category.trim(),
                    id: Date.now() + Math.random(), // New unique ID
                    isFavorite: quote.isFavorite || false
                });
            });
            
            // Save to localStorage
            saveQuotes();
            
            // Update UI
            updateCategorySelector();
            displayAllQuotes();
            updateStatistics();
            displayFavorites();
            updateStorageUsage();
            
            // Reset file input
            event.target.value = '';
            
            // Show import summary
            let message = `Successfully imported ${newQuotes.length} new quotes!`;
            if (duplicateCount > 0) {
                message += ` ${duplicateCount} duplicates were skipped.`;
            }
            if (validQuotes.length - newQuotes.length - duplicateCount > 0) {
                message += ` ${validQuotes.length - newQuotes.length - duplicateCount} invalid quotes were filtered.`;
            }
            
            showNotification(message, 'success');
            
            console.log('File import completed:', {
                totalInFile: importedQuotes.length,
                validQuotes: validQuotes.length,
                newQuotes: newQuotes.length,
                duplicates: duplicateCount
            });
            
        } catch (error) {
            console.error('File import error:', error);
            showNotification('Error importing quotes from file: ' + error.message, 'error');
        } finally {
            // Reset loading state
            importButton.disabled = false;
            importButton.value = originalText;
        }
    };
    
    fileReader.onerror = function() {
        showNotification('Error reading the file. Please try again.', 'error');
        // Reset loading state
        importButton.disabled = false;
        importButton.value = originalText;
    };
    
    fileReader.readAsText(file);
}

// Enhanced import from JSON text
function importFromJson() {
    const importData = document.getElementById('importData').value.trim();
    
    if (!importData) {
        showNotification('Please paste JSON data to import.', 'warning');
        return;
    }
    
    try {
        const importedData = JSON.parse(importData);
        let importedQuotes = [];
        
        // Handle different JSON structures
        if (Array.isArray(importedData)) {
            importedQuotes = importedData;
        } else if (importedData.quotes && Array.isArray(importedData.quotes)) {
            importedQuotes = importedData.quotes;
        } else {
            throw new Error('Invalid JSON structure. Expected array of quotes.');
        }
        
        if (!Array.isArray(importedQuotes)) {
            throw new Error('Imported data must be an array of quotes');
        }
        
        // Validate each quote has required fields
        const validQuotes = importedQuotes.filter(quote => {
            return quote.text && quote.category;
        });
        
        if (validQuotes.length === 0) {
            throw new Error('No valid quotes found in the imported data');
        }
        
        // Add imported quotes to existing quotes with new IDs
        validQuotes.forEach(quote => {
            quotes.push({
                text: quote.text,
                category: quote.category,
                id: Date.now() + Math.random(), // New unique ID
                isFavorite: quote.isFavorite || false
            });
        });
        
        // Save to localStorage
        saveQuotes();
        
        // Update UI
        updateCategorySelector();
        displayAllQuotes();
        updateStatistics();
        displayFavorites();
        updateStorageUsage();
        document.getElementById('importData').value = '';
        
        showNotification(`Successfully imported ${validQuotes.length} quotes from text!`, 'success');
        
    } catch (error) {
        console.error('Text import error:', error);
        showNotification('Error importing quotes: ' + error.message, 'error');
    }
}

// Update storage usage display
function updateStorageUsage() {
    // Calculate localStorage usage
    const quotesData = localStorage.getItem('quotes');
    const localStorageSize = quotesData ? new Blob([quotesData]).size : 0;
    
    // Calculate sessionStorage usage
    let sessionStorageSize = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        sessionStorageSize += new Blob([key + value]).size;
    }
    
    document.getElementById('localStorageUsage').textContent = `${(localStorageSize / 1024).toFixed(2)} KB`;
    document.getElementById('sessionStorageUsage').textContent = `${(sessionStorageSize / 1024).toFixed(2)} KB`;
    document.getElementById('totalQuotesCount').textContent = quotes.length;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ... rest of existing code ...
