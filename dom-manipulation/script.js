// Initialize quotes array with sample data or load from localStorage
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Leadership" },
    { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Inspiration" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", category: "Success" }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Save initial quotes to localStorage if not present
    if (!localStorage.getItem('quotes')) {
        saveQuotesToStorage();
    }
    
    // Populate categories dropdown
    populateCategories();
    
    // Apply saved filter preference
    applySavedFilter();
    
    // Display all quotes initially
    displayQuotes(quotes);
}

// Function to populate categories dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Clear existing options except "All Categories"
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Extract unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    // Save filter preference to localStorage
    localStorage.setItem('selectedCategory', selectedCategory);
    
    let filteredQuotes;
    
    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    displayQuotes(filteredQuotes);
}

// Function to apply saved filter preference
function applySavedFilter() {
    const savedCategory = localStorage.getItem('selectedCategory');
    
    if (savedCategory) {
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.value = savedCategory;
        
        // Apply the filter
        let filteredQuotes;
        if (savedCategory === 'all') {
            filteredQuotes = quotes;
        } else {
            filteredQuotes = quotes.filter(quote => quote.category === savedCategory);
        }
        
        displayQuotes(filteredQuotes);
    }
}

// Function to display quotes in the container
function displayQuotes(quotesToDisplay) {
    const quotesContainer = document.getElementById('quotesContainer');
    quotesContainer.innerHTML = '';
    
    if (quotesToDisplay.length === 0) {
        quotesContainer.innerHTML = '<p>No quotes found for the selected category.</p>';
        return;
    }
    
    quotesToDisplay.forEach((quote, index) => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote';
        quoteElement.innerHTML = `
            <p>"${quote.text}"</p>
            <p><strong>- ${quote.author}</strong></p>
            <p><em>Category: ${quote.category}</em></p>
            <button onclick="deleteQuote(${index})">Delete</button>
        `;
        quotesContainer.appendChild(quoteElement);
    });
}

// Function to add a new quote
function addQuote() {
    const textInput = document.getElementById('quoteText');
    const authorInput = document.getElementById('quoteAuthor');
    const categoryInput = document.getElementById('quoteCategory');
    
    const text = textInput.value.trim();
    const author = authorInput.value.trim();
    const category = categoryInput.value.trim();
    
    if (!text || !author || !category) {
        alert('Please fill in all fields');
        return;
    }
    
    const newQuote = {
        text: text,
        author: author,
        category: category
    };
    
    quotes.push(newQuote);
    saveQuotesToStorage();
    
    // Update categories dropdown if new category
    updateCategoriesIfNew(category);
    
    // Clear input fields
    textInput.value = '';
    authorInput.value = '';
    categoryInput.value = '';
    
    // Apply current filter to show the new quote if it matches
    filterQuotes();
    
    alert('Quote added successfully!');
}

// Function to update categories dropdown if a new category is added
function updateCategoriesIfNew(newCategory) {
    const categoryFilter = document.getElementById('categoryFilter');
    const existingCategories = Array.from(categoryFilter.options).map(option => option.value);
    
    if (!existingCategories.includes(newCategory)) {
        const option = document.createElement('option');
        option.value = newCategory;
        option.textContent = newCategory;
        categoryFilter.appendChild(option);
    }
}

// Function to delete a quote
function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        // Get the actual index in the original quotes array
        const selectedCategory = document.getElementById('categoryFilter').value;
        let actualIndex;
        
        if (selectedCategory === 'all') {
            actualIndex = index;
        } else {
            const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
            const deletedQuote = filteredQuotes[index];
            actualIndex = quotes.findIndex(q => q.text === deletedQuote.text && q.author === deletedQuote.author);
        }
        
        quotes.splice(actualIndex, 1);
        saveQuotesToStorage();
        filterQuotes(); // Refresh the display
    }
}

// Function to save quotes to localStorage
function saveQuotesToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to clear all data (for testing purposes)
function clearAllData() {
    if (confirm('This will clear all quotes and reset to default. Continue?')) {
        localStorage.removeItem('quotes');
        localStorage.removeItem('selectedCategory');
        location.reload();
    }
}

// Add clear button for testing (optional)
document.addEventListener('DOMContentLoaded', function() {
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear All Data (Reset)';
    clearButton.onclick = clearAllData;
    clearButton.style.background = '#dc3545';
    clearButton.style.marginTop = '10px';
    document.querySelector('.container').appendChild(clearButton);
});
