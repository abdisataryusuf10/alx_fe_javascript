// Initial quotes data with fallback to localStorage
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Motivation", id: 1, isFavorite: false },
    { text: "Life is what happens when you're busy making other plans.", category: "Life", id: 2, isFavorite: false },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration", id: 3, isFavorite: false },
    { text: "It does not matter how slowly you go as long as you do not stop.", category: "Perseverance", id: 4, isFavorite: false },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", id: 5, isFavorite: false },
    { text: "Be the change that you wish to see in the world.", category: "Wisdom", id: 6, isFavorite: false },
    { text: "The only true wisdom is in knowing you know nothing.", category: "Wisdom", id: 7, isFavorite: false },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success", id: 8, isFavorite: false }
];

// DOM Elements
const quoteTextElement = document.getElementById('quoteText');
const quoteCategoryElement = document.getElementById('quoteCategory');
const categorySelector = document.getElementById('categorySelector');
const newQuoteBtn = document.getElementById('newQuote');
const toggleFormBtn = document.getElementById('toggleForm');
const addQuoteForm = document.getElementById('addQuoteForm');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quotesContainer = document.getElementById('quotesContainer');
const importFile = document.getElementById('importFile');

// Web Storage Functions
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    console.log('Quotes saved to localStorage:', quotes.length, 'quotes');
}

function saveToSessionStorage(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
}

function getFromSessionStorage(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

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
    document.getElementById('processImport').addEventListener('click', importFromJson);
    
    // Initialize favorites
    displayFavorites();
    
    console.log('Application initialized with', quotes.length, 'quotes from localStorage');
}

// Display a random quote
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
        
        // Save last viewed quote to session storage
        saveToSessionStorage('lastViewedQuote', randomQuote);
        
        // Add favorite button functionality to the displayed quote
        addFavoriteButtonToDisplay(randomQuote);
    } else {
        quoteTextElement.textContent = "No quotes available for this category.";
        quoteCategoryElement.textContent = "None";
    }
}

// Add a new quote
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
    
    // Save to localStorage
    saveQuotes();
    
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
        saveQuotes(); // Save to localStorage
        displayFavorites();
        updateStatistics();
    }
}

// Update the category selector with available categories
function updateCategorySelector() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All"
    while (categorySelector.children.length > 1) {
        categorySelector.removeChild(categorySelector.lastChild);
    }
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelector.appendChild(option);
    });
}

// Display all quotes in the quotes container
function displayAllQuotes() {
    quotesContainer.innerHTML = '';
    
    quotes.forEach((quote, index) => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-item';
        quoteElement.innerHTML = `
            <p class="quote-item-text">"${quote.text}"</p>
            <span class="quote-item-category">${quote.category}</span>
            <div class="quote-actions">
                <button class="favorite-btn ${quote.isFavorite ? 'favorited' : ''}" onclick="toggleFavorite(${quote.id})">
                    ${quote.isFavorite ? '★' : '☆'}
                </button>
                <button class="delete-btn" onclick="deleteQuote(${quote.id})">🗑️</button>
            </div>
        `;
        quotesContainer.appendChild(quoteElement);
    });
}

// Delete a quote
function deleteQuote(quoteId) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes = quotes.filter(quote => quote.id !== quoteId);
        saveQuotes(); // Save to localStorage
        displayAllQuotes();
        updateCategorySelector();
        updateStatistics();
        displayFavorites();
        showRandomQuote();
    }
}

// Filter quotes by selected category
function filterQuotesByCategory() {
    const selectedCategory = categorySelector.value;
    
    if (selectedCategory === 'all') {
        displayAllQuotes();
    } else {
        const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        
        quotesContainer.innerHTML = '';
        filteredQuotes.forEach(quote => {
            const quoteElement = document.createElement('div');
            quoteElement.className = 'quote-item';
            quoteElement.innerHTML = `
                <p class="quote-item-text">"${quote.text}"</p>
                <span class="quote-item-category">${quote.category}</span>
                <div class="quote-actions">
                    <button class="favorite-btn ${quote.isFavorite ? 'favorited' : ''}" onclick="toggleFavorite(${quote.id})">
                        ${quote.isFavorite ? '★' : '☆'}
                    </button>
                    <button class="delete-btn" onclick="deleteQuote(${quote.id})">🗑️</button>
                </div>
            `;
            quotesContainer.appendChild(quoteElement);
        });
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

// JSON Export Functions
function exportAsJSON() {
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
    
    alert(`Exported ${quotes.length} quotes successfully!`);
}

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
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const dataUrl = URL.createObjectURL(dataBlob);
    
    const linkElement = document.createElement('a');
    linkElement.href = dataUrl;
    linkElement.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
}

// JSON Import Functions
function importFromJson() {
    const importData = document.getElementById('importData').value.trim();
    
    if (!importData) {
        alert('Please paste JSON data to import.');
        return;
    }
    
    try {
        const importedQuotes = JSON.parse(importData);
        
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
        document.getElementById('importData').value = '';
        
        alert(`Successfully imported ${validQuotes.length} quotes!`);
        
    } catch (error) {
        alert('Error importing quotes: ' + error.message);
        console.error('Import error:', error);
    }
}

// File-based import function
function importFromJsonFile(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data must be an array of quotes');
            }
            
            // Validate each quote has required fields
            const validQuotes = importedQuotes.filter(quote => {
                return quote.text && quote.category;
            });
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the imported file');
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
            
            // Reset file input
            event.target.value = '';
            
            alert(`Successfully imported ${validQuotes.length} quotes from file!`);
            
        } catch (error) {
            alert('Error importing quotes from file: ' + error.message);
            console.error('File import error:', error);
        }
    };
    
    fileReader.onerror = function() {
        alert('Error reading the file. Please try again.');
    };
    
    fileReader.readAsText(file);
}

// Clear all data (for testing)
function clearAllData() {
    if (confirm('This will delete ALL quotes and reset the application. Are you sure?')) {
        localStorage.removeItem('quotes');
        sessionStorage.clear();
        quotes = [];
        saveQuotes();
        displayAllQuotes();
        updateCategorySelector();
        updateStatistics();
        displayFavorites();
        showRandomQuote();
        alert('All data has been cleared!');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
