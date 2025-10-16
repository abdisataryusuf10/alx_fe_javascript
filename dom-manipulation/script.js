let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Motivation" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Inspiration" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", category: "Life" },
    { text: "The mind is everything. What you think you become.", author: "Buddha", category: "Philosophy" }
];

const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const newQuoteButton = document.getElementById('newQuoteButton');
const addQuoteButton = document.getElementById('addQuoteButton');
const newQuoteTextInput = document.getElementById('newQuoteTextInput');
const newQuoteAuthorInput = document.getElementById('newQuoteAuthorInput');
const newQuoteCategoryInput = document.getElementById('newQuoteCategoryInput');
const categoryFilter = document.getElementById('categoryFilter');

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
    const uniqueCategories = new Set(quotes.map(quote => quote.category));
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected filter
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory');
    if (lastSelectedCategory && Array.from(uniqueCategories).includes(lastSelectedCategory)) {
        categoryFilter.value = lastSelectedCategory;
    } else if (lastSelectedCategory && lastSelectedCategory === "all") {
        categoryFilter.value = "all";
    }
}

function displayRandomQuote() {
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteText.textContent = "No quotes available for this category.";
        quoteAuthor.textContent = "";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteText.textContent = randomQuote.text;
    quoteAuthor.textContent = `- ${randomQuote.author}`;
}

function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastSelectedCategory', selectedCategory); // Save last selected filter
    displayRandomQuote(); // Display a random quote from the filtered list
}

function addQuote() {
    const newQuoteText = newQuoteTextInput.value.trim();
    const newQuoteAuthor = newQuoteAuthorInput.value.trim();
    const newQuoteCategory = newQuoteCategoryInput.value.trim();

    if (newQuoteText && newQuoteAuthor && newQuoteCategory) {
        quotes.push({ text: newQuoteText, author: newQuoteAuthor, category: newQuoteCategory });
        saveQuotes();
        populateCategories(); // Update categories dropdown
        newQuoteTextInput.value = '';
        newQuoteAuthorInput.value = '';
        newQuoteCategoryInput.value = '';
        alert('Quote added successfully!');
        filterQuotes(); // Re-filter and display a quote
    } else {
        alert('Please fill in all fields (Quote, Author, Category).');
    }
}

// Event Listeners
newQuoteButton.addEventListener('click', displayRandomQuote);
addQuoteButton.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', filterQuotes); // Moved from inline HTML

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    filterQuotes(); // Apply initial filter based on saved preference or "all"
});
