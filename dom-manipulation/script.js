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
    
    // Update storage display
    updateStorageDisplay();
    
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
    
    // Section 1: Export Quotes Button event listener
    document.getElementById('exportQuotes').addEventListener('click', exportQuotes);
    
    console.log('Application initialized with', quotes.length, 'quotes from localStorage');
}

// ... existing functions ...

// ============================================================================
// SECTION 1: Export Quotes Button Function
// ============================================================================
function exportQuotes() {
    try {
        if (!quotes || quotes.length === 0) {
            alert('No quotes available to export!');
            return;
        }

        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        
        const linkElement = document.createElement('a');
        linkElement.href = dataUrl;
        linkElement.download = `quotes-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
        
        alert(`Successfully exported ${quotes.length} quotes!`);
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting quotes: ' + error.message);
    }
}

// ============================================================================
// SECTION 2: exportToJsonFile Function
// ============================================================================
function exportToJsonFile() {
    try {
        if (!quotes || quotes.length === 0) {
            alert('No quotes available to export!');
            return;
        }

        // Create export data with metadata
        const exportData = {
            exportedAt: new Date().toISOString(),
            totalQuotes: quotes.length,
            categories: [...new Set(quotes.map(quote => quote.category))],
            quotes: quotes
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        
        const linkElement = document.createElement('a');
        linkElement.href = dataUrl;
        linkElement.download = `quote-collection-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
        
        alert(`Exported ${quotes.length} quotes to JSON file successfully!`);
        
    } catch (error) {
        console.error('Export to JSON file error:', error);
        alert('Error exporting to JSON file: ' + error.message);
    }
}

// ============================================================================
// SECTIONS 3 & 4: importFromJsonFile Function
// ============================================================================
function importFromJsonFile(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('Please select a valid JSON file.');
        event.target.value = ''; // Reset file input
        return;
    }
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
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
                throw new Error('Imported data must contain an array of quotes');
            }
            
            // Validate each quote
            const validQuotes = importedQuotes.filter(quote => {
                return quote.text && quote.category;
            });
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the imported file');
            }
            
            // Add quotes with new IDs
            let addedCount = 0;
            validQuotes.forEach(quote => {
                // Check for duplicates
                const isDuplicate = quotes.some(existingQuote => 
                    existingQuote.text === quote.text && 
                    existingQuote.category === quote.category
                );
                
                if (!isDuplicate) {
                    quotes.push({
                        text: quote.text,
                        category: quote.category,
                        id: Date.now() + Math.random(),
                        isFavorite: quote.isFavorite || false
                    });
                    addedCount++;
                }
            });
            
            // Save to localStorage
            saveQuotes();
            
            // Update UI
            updateCategorySelector();
            displayAllQuotes();
            updateStatistics();
            updateStorageDisplay();
            
            // Reset file input
            event.target.value = '';
            
            alert(`Successfully imported ${addedCount} quotes from file!`);
            
        } catch (error) {
            console.error('File import error:', error);
            alert('Error importing quotes from file: ' + error.message);
        }
    };
    
    fileReader.onerror = function() {
        alert('Error reading the file. Please try again.');
    };
    
    fileReader.readAsText(file);
}

// Manual import function for text area
function importFromJsonManual() {
    const importText = document.getElementById('importJsonText').value.trim();
    
    if (!importText) {
        alert('Please paste JSON data to import.');
        return;
    }
    
    try {
        const importedData = JSON.parse(importText);
        let importedQuotes = [];
        
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
        
        const validQuotes = importedQuotes.filter(quote => {
            return quote.text && quote.category;
        });
        
        if (validQuotes.length === 0) {
            throw new Error('No valid quotes found in the imported data');
        }
        
        let addedCount = 0;
        validQuotes.forEach(quote => {
            const isDuplicate = quotes.some(existingQuote => 
                existingQuote.text === quote.text && 
                existingQuote.category === quote.category
            );
            
            if (!isDuplicate) {
                quotes.push({
                    text: quote.text,
                    category: quote.category,
                    id: Date.now() + Math.random(),
                    isFavorite: quote.isFavorite || false
                });
                addedCount++;
            }
        });
        
        saveQuotes();
        updateCategorySelector();
        displayAllQuotes();
        updateStatistics();
        updateStorageDisplay();
        document.getElementById('importJsonText').value = '';
        
        alert(`Successfully imported ${addedCount} quotes from JSON text!`);
        
    } catch (error) {
        console.error('Manual import error:', error);
        alert('Error importing quotes: ' + error.message);
    }
}

// Update storage display
function updateStorageDisplay() {
    const quotesData = localStorage.getItem('quotes');
    const storageSize = quotesData ? new Blob([quotesData]).size : 0;
    
    document.getElementById('storedQuotes').textContent = quotes.length;
    document.getElementById('storageSize').textContent = `${(storageSize / 1024).toFixed(2)} KB`;
}

// ... rest of existing code ...
