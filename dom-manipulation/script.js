// Global quotes array
let quotes = [];

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
        // Initialize with sample data if no quotes exist in storage
        quotes = [
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                category: "Motivation"
            },
            {
                text: "Innovation distinguishes between a leader and a follower.",
                author: "Steve Jobs",
                category: "Leadership"
            },
            {
                text: "Life is what happens to you while you're busy making other plans.",
                author: "John Lennon",
                category: "Life"
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                category: "Inspiration"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill",
                category: "Success"
            }
        ];
        saveQuotesToStorage();
    }
}

// Save quotes to localStorage
function saveQuotesToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ============================================================================
// SECTION 1: populateCategories Function
// ============================================================================
/**
 * Populate categories dropdown dynamically
 * Extracts unique categories from quotes array and updates the dropdown
 */
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Store the current selected value
    const currentSelection = categoryFilter.value;
    
    // Clear existing options except the first one ("All Categories")
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }

    // Get unique categories and sort them alphabetically
    const categories = [...new Set(quotes.map(quote => quote.category))].sort();
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore the previous selection if it still exists
    if (currentSelection && categories.includes(currentSelection)) {
        categoryFilter.value = currentSelection;
    }
}

// ============================================================================
// SECTION 2: filterQuotes Function - Filtering Logic
// ============================================================================
/**
 * Filter quotes based on selected category
 * Updates the displayed quotes based on the selected filter
 */
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    
    // Clear the quotes container
    const quotesContainer = document.getElementById('quotesContainer');
    quotesContainer.innerHTML = '';

    // ============================================================================
    // SECTION 2a: Logic to filter quotes based on selected category
    // ============================================================================
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes // Show all quotes if "all" is selected
        : quotes.filter(quote => quote.category === selectedCategory); // Filter by category

    // Display appropriate message if no quotes found
    if (filteredQuotes.length === 0) {
        quotesContainer.innerHTML = '<div class="quote-card"><p>No quotes found for the selected category.</p></div>';
        return;
    }

    // ============================================================================
    // SECTION 2b: Update the displayed quotes based on filtered results
    // ============================================================================
    filteredQuotes.forEach((quote, index) => {
        // Find the original index in the main quotes array for proper deletion
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
            <button class="delete-btn" onclick="deleteQuote(${originalIndex})">Delete</button>
        `;
        quotesContainer.appendChild(quoteElement);
    });

    // ============================================================================
    // SECTION 3: Saving the selected category to local storage
    // ============================================================================
    localStorage.setItem('lastSelectedFilter', selectedCategory);
}

// ============================================================================
// SECTION 4: Restoring the last selected category when the page loads
// ============================================================================
/**
 * Restore last selected filter from localStorage
 * Applies the user's last filter preference when the page loads
 */
function restoreLastFilter() {
    const lastFilter = localStorage.getItem('lastSelectedFilter');
    if (lastFilter) {
        const categoryFilter = document.getElementById('categoryFilter');
        
        // Check if the stored filter still exists in categories
        const categories = [...new Set(quotes.map(quote => quote.category))];
        if (lastFilter === 'all' || categories.includes(lastFilter)) {
            categoryFilter.value = lastFilter;
            displayQuotes(lastFilter);
        } else {
            // If stored category no longer exists, default to "all"
            categoryFilter.value = 'all';
            displayQuotes('all');
        }
    }
}

// Display quotes based on current filter (helper function)
function displayQuotes(filterCategory = null) {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Use provided filter or get from dropdown
    const selectedCategory = filterCategory || categoryFilter.value;
    
    // Clear the quotes container
    const quotesContainer = document.getElementById('quotesContainer');
    quotesContainer.innerHTML = '';

    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    // Display appropriate message if no quotes found
    if (filteredQuotes.length === 0) {
        quotesContainer.innerHTML = '<div class="quote-card"><p>No quotes found for the selected category.</p></div>';
        return;
    }

    // Display filtered quotes
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
            <button class="delete-btn" onclick="deleteQuote(${originalIndex})">Delete</button>
        `;
        quotesContainer.appendChild(quoteElement);
    });
}

// Add new quote function
function addQuote() {
    const quoteText = document.getElementById('quoteText').value.trim();
    const quoteAuthor = document.getElementById('quoteAuthor').value.trim();
    const quoteCategory = document.getElementById('quoteCategory').value.trim();

    if (!quoteText || !quoteAuthor || !quoteCategory) {
        alert('Please fill in all fields');
        return;
    }

    const newQuote = {
        text: quoteText,
        author: quoteAuthor,
        category: quoteCategory
    };

    quotes.push(newQuote);
    saveQuotesToStorage();
    
    // Check if category is new and update dropdown if needed
    const categories = [...new Set(quotes.map(quote => quote.category))];
    const categoryExists = categories.includes(quoteCategory);
    
    if (!categoryExists) {
        populateCategories();
    }

    // Clear form
    document.getElementById('quoteText').value = '';
    document.getElementById('quoteAuthor').value = '';
    document.getElementById('quoteCategory').value = '';

    // Refresh display with current filter
    const currentFilter = document.getElementById('categoryFilter').value;
    displayQuotes(currentFilter);
    
    // Show success message
    alert('Quote added successfully!');
}

// Delete quote function
function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        const deletedCategory = quotes[index].category;
        quotes.splice(index, 1);
        saveQuotesToStorage();
        
        // Check if the deleted quote was the last one in its category
        const remainingQuotesInCategory = quotes.filter(quote => quote.category === deletedCategory);
        
        // Refresh categories (will remove empty categories)
        populateCategories();
        
        // Refresh display with current filter
        const currentFilter = document.getElementById('categoryFilter').value;
        
        // If we deleted the last quote in the current category, switch to "All Categories"
        if (currentFilter === deletedCategory && remainingQuotesInCategory.length === 0) {
            document.getElementById('categoryFilter').value = 'all';
            displayQuotes('all');
            localStorage.setItem('lastSelectedFilter', 'all');
        } else {
            displayQuotes(currentFilter);
        }
    }
}

// Clear all data (for testing)
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This will remove all quotes and reset to sample data.')) {
        localStorage.clear();
        loadQuotesFromStorage(); // This will reload sample data
        populateCategories();
        document.getElementById('categoryFilter').value = 'all';
        displayQuotes('all');
        localStorage.setItem('lastSelectedFilter', 'all');
        alert('All data has been cleared and reset to sample quotes.');
    }
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        populateCategories,
        filterQuotes,
        addQuote,
        deleteQuote,
        displayQuotes,
        saveQuotesToStorage,
        loadQuotesFromStorage,
        restoreLastFilter
    };
}
