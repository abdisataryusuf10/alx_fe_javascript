// Sample quotes data
const quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "motivational"
    },
    {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
        category: "success"
    },
    {
        text: "Your time is limited, so don't waste it living someone else's life.",
        author: "Steve Jobs",
        category: "life"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "inspirational"
    },
    {
        text: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle",
        category: "wisdom"
    },
    {
        text: "Whoever is happy will make others happy too.",
        author: "Anne Frank",
        category: "life"
    },
    {
        text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
        author: "Ralph Waldo Emerson",
        category: "motivational"
    },
    {
        text: "You will face many defeats in life, but never let yourself be defeated.",
        author: "Maya Angelou",
        category: "perseverance"
    },
    {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela",
        category: "perseverance"
    },
    {
        text: "In the end, it's not the years in your life that count. It's the life in your years.",
        author: "Abraham Lincoln",
        category: "life"
    },
    {
        text: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        category: "life"
    },
    {
        text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
        author: "Mother Teresa",
        category: "kindness"
    },
    {
        text: "When you reach the end of your rope, tie a knot in it and hang on.",
        author: "Franklin D. Roosevelt",
        category: "perseverance"
    },
    {
        text: "Always remember that you are absolutely unique. Just like everyone else.",
        author: "Margaret Mead",
        category: "wisdom"
    },
    {
        text: "Don't judge each day by the harvest you reap but by the seeds that you plant.",
        author: "Robert Louis Stevenson",
        category: "wisdom"
    },
    {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        category: "success"
    },
    {
        text: "Your time is limited, so don't waste it living someone else's life.",
        author: "Steve Jobs",
        category: "life"
    },
    {
        text: "If life were predictable it would cease to be life, and be without flavor.",
        author: "Eleanor Roosevelt",
        category: "wisdom"
    },
    {
        text: "If you look at what you have in life, you'll always have more.",
        author: "Oprah Winfrey",
        category: "gratitude"
    },
    {
        text: "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
        author: "James Cameron",
        category: "success"
    }
];

// DOM Elements
let categoryFilter, quoteDisplay, quoteCount, resetFilter;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    categoryFilter = document.getElementById('categoryFilter');
    quoteDisplay = document.getElementById('quoteDisplay');
    quoteCount = document.getElementById('quoteCount');
    resetFilter = document.getElementById('resetFilter');
    
    // Populate categories dropdown
    populateCategories();
    
    // Restore last selected category from localStorage
    restoreSelectedCategory();
    
    // Add event listeners
    categoryFilter.addEventListener('change', filterQuotes);
    resetFilter.addEventListener('click', resetFilterHandler);
    
    // Initial display of quotes
    filterQuotes();
});

// Function to populate categories dropdown
function populateCategories() {
    // Extract unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Sort categories alphabetically
    categories.sort();
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    
    // Save the selected category to localStorage
    localStorage.setItem('selectedCategory', selectedCategory);
    
    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Update the displayed quotes
    updateQuotesDisplay(filteredQuotes);
}

// Function to update the quotes display
function updateQuotesDisplay(filteredQuotes) {
    // Clear current quotes display
    quoteDisplay.innerHTML = '';
    
    // Update quote count
    updateQuoteCount(filteredQuotes.length);
    
    // Display message if no quotes found
    if (filteredQuotes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <h3>No quotes found</h3>
            <p>Try selecting a different category or reset the filter to see all quotes.</p>
        `;
        quoteDisplay.appendChild(emptyState);
        return;
    }
    
    // Display filtered quotes
    filteredQuotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-item';
        quoteElement.innerHTML = `
            <blockquote>${quote.text}</blockquote>
            <cite>- ${quote.author}</cite>
            <span class="category-tag">${quote.category}</span>
        `;
        quoteDisplay.appendChild(quoteElement);
    });
}

// Function to update the quote count display
function updateQuoteCount(count) {
    quoteCount.textContent = `Showing ${count} quote${count !== 1 ? 's' : ''}`;
}

// Function to restore the last selected category from localStorage
function restoreSelectedCategory() {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        categoryFilter.value = savedCategory;
    }
}

// Function to handle reset filter button
function resetFilterHandler() {
    categoryFilter.value = 'all';
    filterQuotes();
}
