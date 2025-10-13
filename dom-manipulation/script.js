// ... existing code ...

// Initialize the application
function init() {
    // Display initial random quote
    showRandomQuote();
    
    // Populate category selector
    updateCategorySelector();
    
    // Display all quotes
    displayAllQuotes();
    
    // Update statistics
    updateStatistics();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    categorySelector.addEventListener('change', filterQuotesByCategory);
    
    // New event listeners for additional functionality
    document.getElementById('exportJSON').addEventListener('click', exportAsJSON);
    document.getElementById('exportCSV').addEventListener('click', exportAsCSV);
    document.getElementById('processImport').addEventListener('click', importQuotes);
    
    // Initialize favorites
    displayFavorites();
}

// Add a new quote (fixed function)
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    
    if (text === '' || category === '') {
        alert('Please enter both a quote and a category.');
        return;
    }
    
    const newQuote = { 
        text, 
        category,
        id: Date.now(), // Add unique ID
        isFavorite: false
    };
    quotes.push(newQuote);
    
    // Clear form
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    
    // Update UI
    updateCategorySelector();
    displayAllQuotes();
    showRandomQuote();
    updateStatistics();
    
    // Show confirmation
    alert('Quote added successfully!');
}

// Create add quote form (required function)
function createAddQuoteForm() {
    // This function creates the form programmatically
    // Since we already have it in HTML, we'll just show it
    const form = document.getElementById('addQuoteForm');
    form.classList.remove('hidden');
    
    // Focus on the first input
    document.getElementById('newQuoteText').focus();
}

// Show random quote (enhanced)
function showRandomQuote() {
    const selectedCategory = categorySelector.value;
    let filteredQuotes = quotes;
    
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        
        quoteTextElement.textContent = `"${randomQuote.text}"`;
        quoteCategoryElement.textContent = randomQuote.category;
        
        // Add favorite button functionality to the displayed quote
        addFavoriteButtonToDisplay(randomQuote);
    } else {
        quoteTextElement.textContent = "No quotes available for this category.";
        quoteCategoryElement.textContent = "None";
    }
}

// Add favorite button to displayed quote
function addFavoriteButtonToDisplay(quote) {
    // Remove existing favorite button if any
    const existingBtn = document.querySelector('.favorite-display-btn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-display-btn';
    favoriteBtn.textContent = quote.isFavorite ? '★ Remove Favorite' : '☆ Add to Favorites';
    favoriteBtn.style.marginTop = '10px';
    favoriteBtn.style.backgroundColor = quote.isFavorite ? '#ffd700' : '#2575fc';
    
    favoriteBtn.addEventListener('click', function() {
        toggleFavorite(quote.id);
        showRandomQuote(); // Refresh the display
        displayFavorites();
        updateStatistics();
    });
    
    quoteTextElement.parentNode.appendChild(favoriteBtn);
}

// Toggle favorite status
function toggleFavorite(quoteId) {
    const quoteIndex = quotes.findIndex(quote => quote.id === quoteId);
    if (quoteIndex !== -1) {
        quotes[quoteIndex].isFavorite = !quotes[quoteIndex].isFavorite;
        displayFavorites();
        updateStatistics();
    }
}

// Display favorite quotes
function displayFavorites() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    const favoriteQuotes = quotes.filter(quote => quote.isFavorite);
    
    favoritesContainer.innerHTML = '';
    
    if (favoriteQuotes.length === 0) {
        favoritesContainer.innerHTML = '<p>No favorite quotes yet. Click the star button to add quotes to favorites.</p>';
        return;
    }
    
    favoriteQuotes.forEach(quote => {
        const favoriteElement = document.createElement('div');
        favoriteElement.className = 'favorite-quote';
        favoriteElement.innerHTML = `
            <div>
                <p class="quote-item-text">"${quote.text}"</p>
                <span class="quote-item-category">${quote.category}</span>
            </div>
            <div class="favorite-actions">
                <button class="remove-favorite" data-id="${quote.id}">Remove</button>
            </div>
        `;
        favoritesContainer.appendChild(favoriteElement);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', function() {
            const quoteId = parseInt(this.getAttribute('data-id'));
            toggleFavorite(quoteId);
        });
    });
}

// Update statistics
function updateStatistics() {
    const totalQuotes = quotes.length;
    const totalCategories = new Set(quotes.map(quote => quote.category)).size;
    const favoriteQuotes = quotes.filter(quote => quote.isFavorite).length;
    
    document.getElementById('totalQuotes').textContent = totalQuotes;
    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('favoriteQuotes').textContent = favoriteQuotes;
}

// Export as JSON
function exportAsJSON() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'quotes.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Export as CSV
function exportAsCSV() {
    const headers = ['Text', 'Category', 'Favorite'];
    const csvContent = [
        headers.join(','),
        ...quotes.map(quote => [
            `"${quote.text.replace(/"/g, '""')}"`,
            `"${quote.category}"`,
            quote.isFavorite ? 'Yes' : 'No'
        ].join(','))
    ].join('\n');
    
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
    
    const exportFileDefaultName = 'quotes.csv';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import quotes
function importQuotes() {
    const importData = document.getElementById('importData').value.trim();
    
    if (!importData) {
        alert('Please paste JSON data to import.');
        return;
    }
    
    try {
        const importedQuotes = JSON.parse(importData);
        
        if (!Array.isArray(importedQuotes)) {
            throw new Error('Imported data must be an array');
        }
        
        // Add imported quotes to existing quotes
        importedQuotes.forEach(quote => {
            if (quote.text && quote.category) {
                quotes.push({
                    ...quote,
                    id: quote.id || Date.now() + Math.random(),
                    isFavorite: quote.isFavorite || false
                });
            }
        });
        
        // Update UI
        updateCategorySelector();
        displayAllQuotes();
        updateStatistics();
        document.getElementById('importData').value = '';
        
        alert(`Successfully imported ${importedQuotes.length} quotes!`);
        
    } catch (error) {
        alert('Error importing quotes: ' + error.message);
    }
}

// ... rest of existing code ...
