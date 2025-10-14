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
    },
    { 
        text: "Life is what happens to you while you're busy making other plans.", 
        author: "John Lennon", 
        category: "Life" 
    },
    { 
        text: "The future belongs to those who believe in the beauty of their dreams.", 
        author: "Eleanor Roosevelt", 
        category: "Dreams" 
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
const viewLastQuoteBtn = document.getElementById('viewLastQuoteBtn');
const localStorageCount = document.getElementById('localStorageCount');
const localStorageSize = document.getElementById('localStorageSize');
const sessionQuoteCount = document.getElementById('sessionQuoteCount');
const categoryFilter = document.getElementById('categoryFilter');
const categoryTags = document.getElementById('categoryTags');
const filterStatus = document.getElementById('filterStatus');

// Initialize quotes array from localStorage or use initial quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || initialQuotes;

// Initialize session storage for last viewed quote and filter
let lastQuoteId = sessionStorage.getItem('lastQuoteId') || 0;
let currentFilter = localStorage.getItem('currentFilter') || 'all'; // Changed to localStorage

// Available categories
let categories = [];

// Update storage stats
function updateStorageStats() {
    localStorageCount.textContent = quotes.length;
    
    // Calculate storage size
    const quotesString = JSON.stringify(quotes);
    const sizeInKB = (new Blob([quotesString]).size / 1024).toFixed(2);
    localStorageSize.textContent = `${sizeInKB} KB`;
    
    // Update session storage info
    sessionQuoteCount.textContent = lastQuoteId;
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

// Populate categories in the filter dropdown and tags
function populateCategories() {
    extractCategories();
    
    // Clear existing options except the first one
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Clear category tags
    categoryTags.innerHTML = '';
    
    // Add "All Categories" tag
    const allTag = document.createElement('span');
    allTag.className = `category-tag ${currentFilter === 'all' ? 'active' : ''}`;
    allTag.textContent = 'All Categories';
    allTag.dataset.category = 'all';
    allTag.addEventListener('click', () => {
        categoryFilter.value = 'all';
        filterQuotes();
    });
    categoryTags.appendChild(allTag);
    
    // Add categories to dropdown and tags using map
    categories.map(category => {
        // Add to dropdown
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
        
        // Add as tag
        const tag = document.createElement('span');
        tag.className = `category-tag ${currentFilter === category ? 'active' : ''}`;
        tag.textContent = category;
        tag.dataset.category = category;
        tag.addEventListener('click', () => {
            categoryFilter.value = category;
            filterQuotes();
        });
        categoryTags.appendChild(tag);
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

// Filter quotes based on selected category
function filterQuotes() {
    currentFilter = categoryFilter.value;
    
    // Save filter preference to localStorage for persistence across sessions
    localStorage.setItem('currentFilter', currentFilter);
    
    // Update active tag
    document.querySelectorAll('.category-tag').forEach(tag => {
        if (tag.dataset.category === currentFilter) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
    
    // Update filter status
    updateFilterStatus();
    
    // If we're generating a random quote, make sure it respects the filter
    if (currentFilter !== 'all') {
        // Check if the current displayed quote matches the filter
        const currentQuote = quotes[lastQuoteId];
        if (currentQuote && currentQuote.category !== currentFilter) {
            // If not, generate a new one from the filtered set
            generateRandomQuote();
        }
    }
    
    // Update the displayed quote to ensure it matches the current filter
    const currentQuote = quotes[lastQuoteId];
    if (currentQuote && currentFilter !== 'all' && currentQuote.category !== currentFilter) {
        // Current quote doesn't match filter, find a quote that does
        const matchingQuoteIndex = quotes.findIndex(quote => quote.category === currentFilter);
        if (matchingQuoteIndex !== -1) {
            displayQuote(quotes[matchingQuoteIndex], matchingQuoteIndex);
        } else {
            // No quotes in this category
            quoteText.textContent = `No quotes available in "${currentFilter}" category.`;
            quoteAuthor.textContent = "";
            quoteCategory.textContent = "";
        }
    }
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
    
    // Find the actual index in the original quotes array
    const actualIndex = quotes.findIndex(q => 
        q.text === randomQuote.text && 
        q.author === randomQuote.author && 
        q.category === randomQuote.category
    );
    
    displayQuote(randomQuote, actualIndex);
}

// Display a quote
function displayQuote(quote, index) {
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `- ${quote.author}`;
    quoteCategory.textContent = quote.category;
    
    // Store the last viewed quote in session storage
    lastQuoteId = index;
    sessionStorage.setItem('lastQuoteId', lastQuoteId);
    updateStorageStats();
}

// View last quote from session storage
function viewLastQuote() {
    if (lastQuoteId >= 0 && lastQuoteId < quotes.length) {
        const lastQuote = quotes[lastQuoteId];
        
        // Check if the last quote matches the current filter
        if (currentFilter !== 'all' && lastQuote.category !== currentFilter) {
            alert("The last viewed quote is not in the current filter category.");
            return;
        }
        
        displayQuote(lastQuote, lastQuoteId);
    } else {
        alert("No last quote available or it has been removed.");
    }
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
        
        // Reset form
        newQuoteText.value = '';
        newQuoteAuthor.value = '';
        newQuoteCategory.value = '';
        quoteForm.style.display = 'none';
        
        alert('Quote added successfully!');
        
        // Display the new quote
        const newQuoteIndex = quotes.length - 1;
        displayQuote(newQuote, newQuoteIndex);
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

viewLastQuoteBtn.addEventListener('click', viewLastQuote);

categoryFilter.addEventListener('change', filterQuotes);

// Initialize the application
function initApp() {
    saveQuotes(); // Ensure initial quotes are saved to localStorage
    populateCategories(); // Populate categories dropdown and tags
    
    // Apply the saved filter
    filterQuotes();
    
    // Show a random quote on page load that matches the current filter
    generateRandomQuote();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
