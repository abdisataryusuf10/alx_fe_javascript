// Initial quotes data
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
    { text: "It does not matter how slowly you go as long as you do not stop.", category: "Perseverance" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "Be the change that you wish to see in the world.", category: "Wisdom" },
    { text: "The only true wisdom is in knowing you know nothing.", category: "Wisdom" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" }
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

// Initialize the application
function init() {
    // Display initial random quote
    showRandomQuote();
    
    // Populate category selector
    updateCategorySelector();
    
    // Display all quotes
    displayAllQuotes();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    toggleFormBtn.addEventListener('click', toggleAddQuoteForm);
    addQuoteBtn.addEventListener('click', addQuote);
    categorySelector.addEventListener('change', filterQuotesByCategory);
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
    } else {
        quoteTextElement.textContent = "No quotes available for this category.";
        quoteCategoryElement.textContent = "None";
    }
}

// Toggle the add quote form visibility
function toggleAddQuoteForm() {
    addQuoteForm.classList.toggle('hidden');
    toggleFormBtn.textContent = addQuoteForm.classList.contains('hidden') 
        ? 'Add New Quote' 
        : 'Cancel';
}

// Add a new quote
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    
    if (text === '' || category === '') {
        alert('Please enter both a quote and a category.');
        return;
    }
    
    const newQuote = { text, category };
    quotes.push(newQuote);
    
    // Clear form
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    
    // Update UI
    updateCategorySelector();
    displayAllQuotes();
    showRandomQuote();
    
    // Hide form
    toggleAddQuoteForm();
    
    // Show confirmation
    alert('Quote added successfully!');
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
        `;
        quotesContainer.appendChild(quoteElement);
    });
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
            `;
            quotesContainer.appendChild(quoteElement);
        });
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);