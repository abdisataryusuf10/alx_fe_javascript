// Sample initial quotes
const initialQuotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" }
];

// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const generateBtn = document.getElementById('generateBtn');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const quoteForm = document.getElementById('quoteForm');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteAuthor = document.getElementById('newQuoteAuthor');
const saveQuoteBtn = document.getElementById('saveQuoteBtn');
const importFile = document.getElementById('importFile');
const importBtn = document.getElementById('importBtn');
const viewLastQuoteBtn = document.getElementById('viewLastQuoteBtn');
const localStorageCount = document.getElementById('localStorageCount');
const localStorageSize = document.getElementById('localStorageSize');
const sessionQuoteCount = document.getElementById('sessionQuoteCount');

// Initialize quotes array from localStorage or use initial quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || initialQuotes;

// Initialize session storage for last viewed quote
let lastQuoteId = sessionStorage.getItem('lastQuoteId') || 0;

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

// Generate a random quote
function generateRandomQuote() {
    if (quotes.length === 0) {
        quoteText.textContent = "No quotes available. Add some quotes first!";
        quoteAuthor.textContent = "";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    quoteText.textContent = `"${randomQuote.text}"`;
    quoteAuthor.textContent = `- ${randomQuote.author}`;
    
    // Store the last viewed quote in session storage
    lastQuoteId = randomIndex;
    sessionStorage.setItem('lastQuoteId', lastQuoteId);
    updateStorageStats();
}

// View last quote from session storage
function viewLastQuote() {
    if (lastQuoteId >= 0 && lastQuoteId < quotes.length) {
        const lastQuote = quotes[lastQuoteId];
        quoteText.textContent = `"${lastQuote.text}"`;
        quoteAuthor.textContent = `- ${lastQuote.author}`;
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
            
            // Validate each quote has text and author
            for (let quote of importedQuotes) {
                if (!quote.text || !quote.author) {
                    throw new Error("Invalid quote format: Each quote must have 'text' and 'author' properties");
                }
            }
            
            quotes.push(...importedQuotes);
            saveQuotes();
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
        quoteText.textContent = "All quotes have been cleared. Add new quotes to get started!";
        quoteAuthor.textContent = "";
    }
}

// Event Listeners
generateBtn.addEventListener('click', generateRandomQuote);

addQuoteBtn.addEventListener('click', () => {
    quoteForm.style.display = quoteForm.style.display === 'none' ? 'block' : 'none';
});

saveQuoteBtn.addEventListener('click', () => {
    const text = newQuoteText.value.trim();
    const author = newQuoteAuthor.value.trim();
    
    if (text && author) {
        quotes.push({ text, author });
        saveQuotes();
        
        // Reset form
        newQuoteText.value = '';
        newQuoteAuthor.value = '';
        quoteForm.style.display = 'none';
        
        alert('Quote added successfully!');
    } else {
        alert('Please enter both quote text and author.');
    }
});

exportBtn.addEventListener('click', exportQuotes);

clearBtn.addEventListener('click', clearAllQuotes);

importBtn.addEventListener('click', () => {
    importFile.click();
});

importFile.addEventListener('change', importFromJsonFile);

viewLastQuoteBtn.addEventListener('click', viewLastQuote);

// Initialize the application
saveQuotes(); // Ensure initial quotes are saved to localStorage
generateRandomQuote(); // Show a random quote on page load
