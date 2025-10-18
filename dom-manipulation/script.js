// Sample initial quotes with categories
const initialQuotes = [
    { 
        text: "The only way to do great work is to love what you do.", 
        author: "Steve Jobs", 
        category: "Inspiration" 
    },
    { 
        text: "Innovation distinguishes between a leader and a follower.", 
        author: "Steve Jobs", 
        category: "Technology" 
    },
    { 
        text: "Your time is limited, so don't waste it living someone else's life.", 
        author: "Steve Jobs", 
        category: "Life" 
    },
    { 
        text: "Stay hungry, stay foolish.", 
        author: "Steve Jobs", 
        category: "Motivation" 
    },
    { 
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", 
        author: "Nelson Mandela", 
        category: "Perseverance" 
    },
    { 
        text: "The way to get started is to quit talking and begin doing.", 
        author: "Walt Disney", 
        category: "Action" 
    },
    { 
        text: "If life were predictable it would cease to be life, and be without flavor.", 
        author: "Eleanor Roosevelt", 
        category: "Life" 
    }
];

// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const generateBtn = document.getElementById('generateBtn');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const quoteForm = document.getElementById('quoteForm');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteAuthor = document.getElementById('newQuoteAuthor');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const saveQuoteBtn = document.getElementById('saveQuoteBtn');
const importFile = document.getElementById('importFile');
const importBtn = document.getElementById('importBtn');
const localStorageCount = document.getElementById('localStorageCount');
const localStorageSize = document.getElementById('localStorageSize');
const categoryFilter = document.getElementById('categoryFilter');
const filterStatus = document.getElementById('filterStatus');

// ADDED: New DOM elements for quotes display
const quotesContainer = document.getElementById('quotesContainer');
const quotesList = document.getElementById('quotesList');
const currentCategory = document.getElementById('currentCategory');

// Initialize quotes array from localStorage or use initial quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || initialQuotes;

// Initialize current filter from localStorage
let currentFilter = localStorage.getItem('currentFilter') || 'all';

// Available categories
let categories = [];

// Update storage stats
function updateStorageStats() {
    localStorageCount.textContent = quotes.length;
    
    // Calculate storage size
    const quotesString = JSON.stringify(quotes);
    const sizeInKB = (new Blob([quotesString]).size / 1024).toFixed(2);
    localStorageSize.textContent = `${sizeInKB} KB`;
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    updateStorageStats();
}

// Extract unique categories from quotes using map
function extractCategories() {
    // Using map to get all categories and then filter unique ones
    const allCategories = quotes.map(quote => quote.category || 'Uncategorized');
    categories = [...new Set(allCategories)].sort();
}

// Populate categories in the filter dropdown
function populateCategories() {
    extractCategories();
    
    // Clear existing options except the first one
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Add categories to dropdown using map
    categories.map(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Set the current filter from localStorage
    categoryFilter.value = currentFilter;
    
    // Update filter status
    updateFilterStatus();
}

// Update filter status text
function updateFilterStatus() {
    if (currentFilter === 'all') {
        filterStatus.textContent = `Showing all ${quotes.length} quotes`;
    } else {
        const filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
        filterStatus.textContent = `Showing ${filteredQuotes.length} quotes in "${currentFilter}"`;
    }
}

// UPDATED: Enhanced filterQuotes function with quoteDisplay
function filterQuotes() {
    currentFilter = categoryFilter.value;
    
    // Save filter preference to localStorage
    localStorage.setItem('currentFilter', currentFilter);
    
    // Update filter status
    updateFilterStatus();
    
    // Update current category display
    currentCategory.textContent = currentFilter === 'all' ? 'All Categories' : currentFilter;
    
    // Show/hide quotes container based on filter
    if (currentFilter !== 'all') {
        quotesContainer.style.display = 'block';
        displayFilteredQuotes();
    } else {
        quotesContainer.style.display = 'none';
    }
    
    // If we're generating a random quote, make sure it respects the filter
    if (currentFilter !== 'all') {
        // Check if the current displayed quote matches the filter
        const currentQuote = getCurrentQuote();
        if (currentQuote && currentQuote.category !== currentFilter) {
            // If not, generate a new one from the filtered set
            generateRandomQuote();
        }
    }
}

// ADDED: Display filtered quotes in the quotes container
function displayFilteredQuotes() {
    // Clear existing quotes
    quotesList.innerHTML = '';
    
    // Filter quotes based on current category
    const filteredQuotes = currentFilter === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === currentFilter);
    
    if (filteredQuotes.length === 0) {
        const noQuotesMessage = document.createElement('div');
        noQuotesMessage.className = 'quote-item';
        noQuotesMessage.innerHTML = `
            <p class="quote-item-text">No quotes found in this category.</p>
        `;
        quotesList.appendChild(noQuotesMessage);
        return;
    }
    
    // Display each filtered quote
    filteredQuotes.forEach((quote, index) => {
        const quoteItem = document.createElement('div');
        quoteItem.className = 'quote-item';
        quoteItem.innerHTML = `
            <p class="quote-item-text">"${quote.text}"</p>
            <p class="quote-item-author">- ${quote.author}</p>
            <span class="quote-item-category">${quote.category}</span>
        `;
        quotesList.appendChild(quoteItem);
    });
}

// Get the current displayed quote
function getCurrentQuote() {
    const currentQuoteText = quoteText.textContent.replace(/"/g, '').trim();
    const currentQuoteAuthor = quoteAuthor.textContent.replace('-', '').trim();
    
    return quotes.find(quote => 
        quote.text === currentQuoteText && 
        quote.author === currentQuoteAuthor
    );
}

// Generate a random quote
function generateRandomQuote() {
    if (quotes.length === 0) {
        quoteText.textContent = "No quotes available. Add some quotes first!";
        quoteAuthor.textContent = "";
        quoteCategory.textContent = "";
        return;
    }
    
    let filteredQuotes = quotes;
    if (currentFilter !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
    }
    
    if (filteredQuotes.length === 0) {
        quoteText.textContent = `No quotes available in "${currentFilter}" category.`;
        quoteAuthor.textContent = "";
        quoteCategory.textContent = "";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    displayQuote(randomQuote);
}

// Display a quote
function displayQuote(quote) {
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `- ${quote.author}`;
    quoteCategory.textContent = quote.category;
}

// Export quotes to JSON file
function exportQuotes() {
    if (quotes.length === 0) {
        alert("No quotes to export!");
        return;
    }
    
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'my-quotes.json';
    link.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error("Invalid format: Expected an array of quotes");
            }
            
            // Validate each quote has required properties
            for (let quote of importedQuotes) {
                if (!quote.text || !quote.author) {
                    throw new Error("Invalid quote format: Each quote must have 'text' and 'author' properties");
                }
                
                // Set default category if not provided
                if (!quote.category) {
                    quote.category = "Uncategorized";
                }
            }
            
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories(); // Update categories after import
            displayFilteredQuotes(); // Update displayed quotes
            alert(`Successfully imported ${importedQuotes.length} quotes!`);
            
            // Reset file input
            importFile.value = '';
        } catch (error) {
            alert(`Error importing quotes: ${error.message}`);
        }
    };
    fileReader.readAsText(file);
}

// Clear all quotes
function clearAllQuotes() {
    if (confirm("Are you sure you want to clear all quotes? This action cannot be undone.")) {
        quotes = [];
        saveQuotes();
        populateCategories(); // Update categories after clear
        displayFilteredQuotes(); // Update displayed quotes
        quoteText.textContent = "All quotes have been cleared. Add new quotes to get started!";
        quoteAuthor.textContent = "";
        quoteCategory.textContent = "";
    }
}

// Add a new quote
function addNewQuote() {
    const text = newQuoteText.value.trim();
    const author = newQuoteAuthor.value.trim();
    const category = newQuoteCategory.value.trim() || "Uncategorized";
    
    if (text && author) {
        const newQuote = { text, author, category };
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
        
        alert('Quote added successfully!');
        
        // Display the new quote
        displayQuote(newQuote);
    } else {
        alert('Please enter both quote text and author.');
    }
}

// Event Listeners
generateBtn.addEventListener('click', generateRandomQuote);

addQuoteBtn.addEventListener('click', () => {
    quoteForm.style.display = quoteForm.style.display === 'none' ? 'block' : 'none';
});

saveQuoteBtn.addEventListener('click', addNewQuote);

exportBtn.addEventListener('click', exportQuotes);

clearBtn.addEventListener('click', clearAllQuotes);

importBtn.addEventListener('click', () => {
    importFile.click();
});

importFile.addEventListener('change', importFromJsonFile);

categoryFilter.addEventListener('change', filterQuotes);

// Initialize the application
function initApp() {
    saveQuotes(); // Ensure initial quotes are saved to localStorage
    populateCategories(); // Populate categories dropdown
    
    // Apply the saved filter and show initial quote
    filterQuotes(); // This will restore the last selected category
    generateRandomQuote();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
