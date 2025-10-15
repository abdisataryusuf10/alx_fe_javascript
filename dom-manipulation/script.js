// Assume 'quotes' is your array of quote objects, loaded from localStorage or initially hardcoded.
// Example structure: [{ text: "Quote 1", author: "Author 1", category: "Inspiration" }, ...]
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Key for storing the last selected filter in localStorage
const LAST_FILTER_KEY = 'lastSelectedCategoryFilter';

/**
 * Populates the category filter dropdown with unique categories from the quotes array.
 * @param {string} [selectedCategory='all'] - The category to be set as selected after population.
 */
function populateCategories(selectedCategory = 'all') {
    const filterSelect = document.getElementById('categoryFilter');
    
    // 1. Extract unique categories.
    const uniqueCategories = ['all', ...new Set(quotes.map(quote => quote.category))].sort();

    // 2. Clear existing options (except for 'All Categories' if it's the first one, 
    // but clearing all and recreating is safer for dynamic updates).
    filterSelect.innerHTML = ''; 

    // 3. Populate the dropdown.
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        // Capitalize the first letter for display, but keep the value lowercase/original
        const displayCategory = category === 'all' ? 'All Categories' : 
                                 category.charAt(0).toUpperCase() + category.slice(1);
        
        option.value = category;
        option.textContent = displayCategory;

        // Set the option as selected if it matches the persisted or default category
        if (category === selectedCategory) {
            option.selected = true;
        }

        filterSelect.appendChild(option);
    });
}

/**
 * Implements the filtering logic based on the selected category and updates the DOM.
 */
function filterQuotes() {
    const filterSelect = document.getElementById('categoryFilter');
    const selectedCategory = filterSelect.value;
    
    let filteredQuotes;

    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        // Filter quotes where the category matches the selected value
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // 1. Update Web Storage with the user's last selected filter.
    localStorage.setItem(LAST_FILTER_KEY, selectedCategory);
    
    // 2. Display the filtered quotes (You need to ensure this function exists and works)
    displayQuotes(filteredQuotes);
    
    // Optional: Log the action for debugging
    console.log(`Quotes filtered by: ${selectedCategory}`);
}

/**
 * Loads the last selected filter from localStorage and applies it.
 */
function loadAndApplyLastFilter() {
    const lastFilter = localStorage.getItem(LAST_FILTER_KEY) || 'all';
    
    // Populate categories, ensuring the last selected one is chosen
    populateCategories(lastFilter);

    // Now, explicitly run the filter function to display the correct quotes
    // The filterQuotes function will read the value set by populateCategories
    filterQuotes(); 
}

/**
 * Enhanced function to add a new quote, update localStorage, and dynamically
 * update the category dropdown if a new category is introduced.
 * @param {object} newQuote - The quote object to add.
 */
function addQuote(newQuote) {
    // 1. Add the new quote to the array
    quotes.push(newQuote);

    // 2. Update localStorage for quotes
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // 3. Check if the new quote category is new and update the dropdown.
    // We pass the currently active filter so it remains selected after repopulation.
    const currentFilter = localStorage.getItem(LAST_FILTER_KEY) || 'all';
    populateCategories(currentFilter); 

    // 4. Re-apply the current filter to display the new quote if the category matches.
    filterQuotes(); 
}

// --- Initialization ---
// You MUST call loadAndApplyLastFilter when the page loads to set up the filter, 
// restore the last selection, and display the initial set of quotes.
document.addEventListener('DOMContentLoaded', () => {
    // Other setup for your quote generator (like loading initial quotes, event listeners)
    
    // This is the CRITICAL line to run the filter system on page load.
    loadAndApplyLastFilter(); 
    
    // ... rest of your initial setup code
});

// NOTE: You will need to modify your 'addQuote' function (if it already existed) 
// or ensure it calls the enhanced addQuote function defined above.

// NOTE: Ensure your existing displayQuotes(quotesArray) function is available and 
// correctly renders the quotes array passed to it to the DOM.
