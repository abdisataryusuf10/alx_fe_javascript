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
    
    // Section 4: Restore last selected category when page loads
    restoreCategoryPreference();
    
    // Populate category selectors
    updateCategorySelector();
    updateFilterCategorySelector();
    updateQuickFilterButtons();
    
    // Display all quotes
    displayAllQuotes();
    
    // Update statistics
    updateStatistics();
    updateFilterStatistics();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    
    // Section 1: Filter event listeners
    document.getElementById('applyFilter').addEventListener('click', applyCategoryFilter);
    document.getElementById('clearFilter').addEventListener('click', clearCategoryFilter);
    document.getElementById('filterCategory').addEventListener('change', updateFilterPreview);
    
    // Section 2: Persistence event listeners
    document.getElementById('saveCategoryPref').addEventListener('change', toggleCategoryPersistence);
    document.getElementById('resetCategoryPref').addEventListener('click', resetCategoryPreference);
    
    // Initialize favorites
    displayFavorites();
    
    console.log('Application initialized with', quotes.length, 'quotes from localStorage');
}

// ============================================================================
// SECTION 1: filterQuote Function and Filter Logic
// ============================================================================
function filterQuote(quote, category) {
    // Filter logic for individual quote
    if (category === 'all') {
        return true;
    }
    return quote.category === category;
}

function applyCategoryFilter() {
    const selectedCategory = document.getElementById('filterCategory').value;
    
    // Save filter preference to localStorage
    if (document.getElementById('saveCategoryPref').checked) {
        localStorage.setItem('preferredCategory', selectedCategory);
    }
    
    // Filter and update displayed quotes
    filterAndUpdateQuotes(selectedCategory);
    
    // Update filter status
    updateFilterStatus(selectedCategory);
    
    console.log(`Applied filter: ${selectedCategory}`);
}

function filterAndUpdateQuotes(category) {
    const filteredQuotes = quotes.filter(quote => filterQuote(quote, category));
    
    // Update quotes container with filtered quotes
    quotesContainer.innerHTML = '';
    
    if (filteredQuotes.length === 0) {
        quotesContainer.innerHTML = `
            <div class="no-quotes-message">
                <p>No quotes found in the "${category}" category.</p>
                <button onclick="clearCategoryFilter()">Show All Quotes</button>
            </div>
        `;
    } else {
        filteredQuotes.forEach((quote, index) => {
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
    
    // Update filter statistics
    updateFilterStatistics(category, filteredQuotes.length);
}

function clearCategoryFilter() {
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('filterStatus').textContent = 'Showing all quotes';
    
    // Clear from localStorage
    localStorage.removeItem('preferredCategory');
    
    // Show all quotes
    displayAllQuotes();
    updateFilterStatistics('all', quotes.length);
}

function updateFilterPreview() {
    const selectedCategory = document.getElementById('filterCategory').value;
    const quoteCount = selectedCategory === 'all' 
        ? quotes.length 
        : quotes.filter(quote => quote.category === selectedCategory).length;
    
    document.getElementById('filterStatus').textContent = 
        `Preview: ${quoteCount} quotes in "${selectedCategory}" category`;
}

// ============================================================================
// SECTION 2: Saving Selected Category to Local Storage
// ============================================================================
function saveCategoryPreference(category) {
    if (document.getElementById('saveCategoryPref').checked) {
        localStorage.setItem('preferredCategory', category);
        localStorage.setItem('categoryPersistenceEnabled', 'true');
        console.log('Category preference saved:', category);
    }
}

function restoreCategoryPreference() {
    const persistenceEnabled = localStorage.getItem('categoryPersistenceEnabled') === 'true';
    const savedCategory = localStorage.getItem('preferredCategory');
    
    // Update checkbox state
    document.getElementById('saveCategoryPref').checked = persistenceEnabled;
    
    if (persistenceEnabled && savedCategory) {
        // Apply saved category filter
        document.getElementById('filterCategory').value = savedCategory;
        document.getElementById('categorySelector').value = savedCategory;
        applyCategoryFilter();
        console.log('Restored category preference:', savedCategory);
    }
}

function toggleCategoryPersistence() {
    const isEnabled = document.getElementById('saveCategoryPref').checked;
    localStorage.setItem('categoryPersistenceEnabled', isEnabled.toString());
    
    if (!isEnabled) {
        // Clear saved preference if persistence is disabled
        localStorage.removeItem('preferredCategory');
    }
    
    console.log('Category persistence:', isEnabled ? 'enabled' : 'disabled');
}

function resetCategoryPreference() {
    localStorage.removeItem('preferredCategory');
    localStorage.removeItem('categoryPersistenceEnabled');
    document.getElementById('saveCategoryPref').checked = false;
    clearCategoryFilter();
    console.log('Category preferences reset');
}

// ============================================================================
// SECTION 3: Filter Statistics and Display Updates
// ============================================================================
function updateFilterStatistics(category = 'all', visibleCount = null) {
    const currentVisible = visibleCount !== null ? visibleCount : quotes.length;
    const activeFilter = category === 'all' ? 'None' : category;
    
    document.getElementById('visibleQuotes').textContent = currentVisible;
    document.getElementById('filteredCategory').textContent = activeFilter;
    
    // Update main statistics as well
    updateStatistics();
}

// ============================================================================
// SECTION 4: Enhanced Category Management
// ============================================================================
function updateFilterCategorySelector() {
    const filterCategorySelect = document.getElementById('filterCategory');
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All"
    while (filterCategorySelect.children.length > 1) {
        filterCategorySelect.removeChild(filterCategorySelect.lastChild);
    }
    
    // Add category options with counts
    categories.forEach(category => {
        const count = quotes.filter(quote => quote.category === category).length;
        const option = document.createElement('option');
        option.value = category;
        option.textContent = `${category} (${count})`;
        filterCategorySelect.appendChild(option);
    });
}

function updateQuickFilterButtons() {
    const quickFilterButtons = document.getElementById('quickFilterButtons');
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    quickFilterButtons.innerHTML = '';
    
    categories.forEach(category => {
        const count = quotes.filter(quote => quote.category === category).length;
        const button = document.createElement('button');
        button.className = 'quick-filter-btn';
        button.textContent = `${category} (${count})`;
        button.onclick = () => {
            document.getElementById('filterCategory').value = category;
            applyCategoryFilter();
        };
        quickFilterButtons.appendChild(button);
    });
    
    // Add "All" button
    const allButton = document.createElement('button');
    allButton.className = 'quick-filter-btn all-btn';
    allButton.textContent = `All (${quotes.length})`;
    allButton.onclick = clearCategoryFilter;
    quickFilterButtons.appendChild(allButton);
}

// Enhanced showRandomQuote with Math.random
function showRandomQuote() {
    const selectedCategory = document.getElementById('filterCategory').value;
    let filteredQuotes = quotes;
    
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (filteredQuotes.length > 0) {
        // SECTION 1: Using Math.random for random selection
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        
        quoteTextElement.textContent = `"${randomQuote.text}"`;
        quoteCategoryElement.textContent = randomQuote.category;
        
        // Save last viewed quote to session storage
        saveToSessionStorage('lastViewedQuote', randomQuote);
        
        console.log(`Displayed random quote from ${filteredQuotes.length} available quotes`);
    } else {
        quoteTextElement.textContent = "No quotes available for the current filter.";
        quoteCategoryElement.textContent = "None";
    }
}

// Update other functions to maintain filter state
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
        id: Date.now(),
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
    updateFilterCategorySelector();
    updateQuickFilterButtons();
    displayAllQuotes();
    showRandomQuote();
    updateStatistics();
    updateFilterStatistics();
    
    alert('Quote added successfully!');
}

function deleteQuote(quoteId) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes = quotes.filter(quote => quote.id !== quoteId);
        saveQuotes();
        displayAllQuotes();
        updateCategorySelector();
        updateFilterCategorySelector();
        updateQuickFilterButtons();
        updateStatistics();
        updateFilterStatistics();
        displayFavorites();
        showRandomQuote();
    }
}

// ... rest of existing code ...
