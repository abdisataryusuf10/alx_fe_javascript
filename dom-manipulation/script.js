// --- Initial Quotes Array (Example) ---
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Success is not final, failure is not fatal.", author: "Winston Churchill", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Inspiration" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House", category: "Programming" }
];

// --- Step 1: Populate Categories Dynamically ---
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Get unique categories from quotes
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear existing options except 'All'
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Add unique categories to dropdown
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = lastFilter;

  // Apply the filter on page load
  filterQuotes();
}

// --- Step 2: Filter Quotes Based on Selected Category ---
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const quoteContainer = document.getElementById("quoteContainer");

  // Save selected filter in localStorage
  localStorage.setItem("selectedCategory", selectedCategory);

  // Filter quotes
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  // Display filtered quotes
  quoteContainer.innerHTML = "";
  if (filteredQuotes.length === 0) {
    quoteContainer.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  filteredQuotes.forEach(q => {
    const div = document.createElement("div");
    div.className = "quote";
    div.innerHTML = `
      <blockquote>"${q.text}"</blockquote>
      <p>- ${q.author} (${q.category})</p>
    `;
    quoteContainer.appendChild(div);
  });
}

// --- Step 3: Add Quote Function (Updates Categories + Web Storage) ---
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (!text || !author || !category) {
    alert("Please fill all fields before adding a quote!");
    return;
  }

  const newQuote = { text, author, category };
  quotes.push(newQuote);

  // Save updated quotes to localStorage
  localStorage.setItem("quotes", JSON.stringify(quotes));

  // Update dropdown if new category added
  populateCategories();

  // Reset form fields
  document.getElementById("quoteText").value = "";
  document.getElementById("quoteAuthor").value = "";
  document.getElementById("quoteCategory").value = "";

  // Refresh displayed quotes
  filterQuotes();
}

// --- Initialize App on Page Load ---
document.addEventListener("DOMContentLoaded", populateCategories);
