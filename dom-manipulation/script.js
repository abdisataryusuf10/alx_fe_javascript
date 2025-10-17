// Default quotes data
const defaultQuotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "Motivation"
    },
    {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
        category: "Innovation"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "Inspiration"
    },
    {
        text: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        category: "Wisdom"
    },
    {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        category: "Motivation"
    }
];

// Global variables
let quotes = [];

// DOM Elements
let categoryFilter;
let quotesContainer;
let quoteTextInput;
let quoteAuthorInput;
let quoteCategoryInput;
let addQuoteBtn;
let resetBtn;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    initializeApp();
    setupEventListeners();
});

/**
 * Initialize DOM element references
 */
function initializeDOMElements() {
    categoryFilter = document.getElementById('categoryFilter');
    quotesContainer = document.getElementById('quotesContainer');
    quoteTextInput = document.getElementById('quoteText');
    quoteAuthorInput = document.getElementById('quoteAuthor');
    quoteCategoryInput = document.getElementById('quoteCategory');
    addQuoteBtn = document.getElementById('addQuoteBtn');
    resetBtn = document.getElementById('resetBtn');
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
    categoryFilter.addEventListener('change', filterQuotes);
    addQuoteBtn.addEventListener('click', addQuote);
    resetBtn.addEventListener('click', resetToDefault);
}

/**
 * Initialize the application
 */
function initializeApp() {
    // Load quotes from localStorage or use default
    const storedQuotes = localStorage.getItem('quotes');
    quotes = storedQuotes ? JSON.parse(storedQuotes) : [...defaultQuotes];
    
    // Save default quotes if none exist
    if (!storedQuotes) {
        localStorage.setItem('quotes', JSON.stringify(defaultQuotes));
    }
    
    // Populate categories dropdown
    populateCategories();
    
    // Load saved filter preference
    loadFilterPreference();
    
    // Display quotes
    displayQuotes();
}

/**
 * Step 2: Populate Categories Dynamically
 * Extracts unique categories from quotes and populates the dropdown
 */
function populateCategories() {
    // Clear existing options except "All Categories"
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Get unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

/**
 * Step 2: Filter Quotes Based on Selected Category
 * Updates the displayed quotes based on the selected category
 */
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    
    // Save filter preference to localStorage
    localStorage.setItem('selectedCategory', selectedCategory);
    
    displayQuotes();
}

/**
 * Load saved filter preference from localStorage
 */
function loadFilterPreference() {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        categoryFilter.value = savedCategory;
    }
}

/**
 * Display quotes based on current filter selection
 */
function displayQuotes() {
    const selectedCategory = categoryFilter.value;
    
    // Clear container
    quotesContainer.innerHTML = '';
    
    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display message if no quotes found
    if (filteredQuotes.length === 0) {
        quotesContainer.innerHTML = '<p>No quotes found for the selected category.</p>';
        return;
    }
    
    // Create and append quote elements
    filteredQuotes.forEach((quote, index) => {
        const quoteElement = createQuoteElement(quote, index);
        quotesContainer.appendChild(quoteElement);
    });
}

/**
 * Create a quote element with proper structure and styling
 * @param {Object} quote - The quote object
 * @param {number} index - The index of the quote in the array
 * @returns {HTMLElement} The created quote element
 */
function createQuoteElement(quote, index) {
    const quoteElement = document.createElement('div');
    quoteElement.className = 'quote';
    quoteElement.innerHTML = `
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-author">- ${quote.author}</div>
        <span class="quote-category">${quote.category}</span>
        <button class="delete-btn" data-index="${index}">Delete</button>
    `;
    
    // Add event listener to delete button
    const deleteBtn = quoteElement.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        deleteQuote(parseInt(this.getAttribute('data-index')));
    });
    
    return quoteElement;
}

/**
 * Step 3: Add a new quote to the system
 * Updates web storage and refreshes the display
 */
function addQuote() {
    const text = quoteTextInput.value.trim();
    const author = quoteAuthorInput.value.trim();
    const category = quoteCategoryInput.value.trim();
    
    // Validate input
    if (!validateQuoteInput(text, author, category)) {
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text: text,
        author: author,
        category: category
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Update localStorage
    updateLocalStorage();
    
    // Update categories dropdown if new category
    updateCategoriesIfNew(category);
    
    // Clear form
    clearQuoteForm();
    
    // Refresh quotes display
    displayQuotes();
    
    // Show success message
    alert('Quote added successfully!');
}

/**
 * Validate quote input fields
 * @param {string} text - Quote text
 * @param {string} author - Quote author
 * @param {string} category - Quote category
 * @returns {boolean} True if validation passes
 */
function validateQuoteInput(text, author, category) {
    if (!text) {
        alert('Please enter quote text');
        quoteTextInput.focus();
        return false;
    }
    
    if (!author) {
        alert('Please enter author name');
        quoteAuthorInput.focus();
        return false;
    }
    
    if (!category) {
        alert('Please enter category');
        quoteCategoryInput.focus();
        return false;
    }
    
    return true;
}

/**
 * Update categories dropdown if a new category is added
 * @param {string} newCategory - The new category to check
 */
function updateCategoriesIfNew(newCategory) {
    const existingCategories = [...categoryFilter.options].map(option => option.value);
    if (!existingCategories.includes(newCategory)) {
        populateCategories();
    }
}

/**
 * Clear the quote input form
 */
function clearQuoteForm() {
    quoteTextInput.value = '';
    quoteAuthorInput.value = '';
    quoteCategoryInput.value = '';
}

/**
 * Delete a quote from the system
 * @param {number} index - The index of the quote to delete
 */
function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes.splice(index, 1);
        updateLocalStorage();
        populateCategories();
        displayQuotes();
    }
}

/**
 * Update localStorage with current quotes array
 */
function updateLocalStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Reset the application to default quotes
 */
function resetToDefault() {
    if (confirm('This will reset all quotes to default and clear your changes. Continue?')) {
        quotes = [...defaultQuotes];
        localStorage.setItem('quotes', JSON.stringify(defaultQuotes));
        localStorage.removeItem('selectedCategory');
        populateCategories();
        categoryFilter.value = 'all';
        displayQuotes();
        alert('Quotes reset to default successfully!');
    }
}

// Export functions for testing purposes (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        populateCategories,
        filterQuotes,
        addQuote,
        deleteQuote,
        resetToDefault,
        validateQuoteInput
    };
}
