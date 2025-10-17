const contentData = [
    { id: 1, title: 'AI Ethics in Practice', category: 'Technology', text: 'An exploration of the moral considerations for AI development.' },
    { id: 2, title: 'The World of Quantum Physics', category: 'Science', text: 'A deep dive into the strange and fascinating rules of quantum mechanics.' },
    { id: 3, title: 'Impressionist Painting Techniques', category: 'Art', text: 'Learning the brushwork and color theory of famous Impressionist artists.' },
    { id: 4, title: 'Next-Gen Programming Languages', category: 'Technology', text: 'A look at new languages that are changing the way we code.' },
    { id: 5, title: 'Exploring the Solar System', category: 'Science', text: 'A beginner\'s guide to the planets and celestial bodies in our solar system.' }
];
const contentContainer = document.getElementById('content-container');
const filterCheckboxes = document.querySelectorAll('.controls input[type="checkbox"]');

// Load or initialize data in localStorage
function initializeData() {
    const storedData = localStorage.getItem('filteredContentData');
    if (!storedData) {
        localStorage.setItem('filteredContentData', JSON.stringify(contentData));
    }
}

// Save active filters to localStorage
function saveFilters() {
    const activeFilters = Array.from(filterCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    localStorage.setItem('activeFilters', JSON.stringify(activeFilters));
}

// Load filters from localStorage and apply them
function loadFilters() {
    const activeFilters = JSON.parse(localStorage.getItem('activeFilters')) || ['all'];
    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = activeFilters.includes(checkbox.value);
    });
    return activeFilters;
}

// Render the content on the page
function renderContent(filteredItems) {
    contentContainer.innerHTML = ''; // Clear existing content
    if (filteredItems.length === 0) {
        contentContainer.innerHTML = '<p>No content matches your filter.</p>';
        return;
    }

    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'content-item';
        itemElement.innerHTML = `
            <h3>${item.title}</h3>
            <p><strong>Category:</strong> ${item.category}</p>
            <p>${item.text}</p>
        `;
        contentContainer.appendChild(itemElement);
    });
}

// Filter the content based on active checkboxes
function filterContent() {
    const allCheckbox = document.getElementById('category-all');
    const selectedCategories = Array.from(filterCheckboxes)
        .filter(checkbox => checkbox.checked && checkbox.value !== 'all')
        .map(checkbox => checkbox.value);

    let filteredItems;
    if (allCheckbox.checked || selectedCategories.length === 0) {
        filteredItems = contentData;
    } else {
        filteredItems = contentData.filter(item => selectedCategories.includes(item.category));
    }

    renderContent(filteredItems);
    saveFilters(); // Save preferences whenever the filter changes
}

// Handle checkbox events
filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const allCheckbox = document.getElementById('category-all');
        if (event.target.value === 'all') {
            filterCheckboxes.forEach(cb => {
                if (cb !== allCheckbox) {
                    cb.checked = false;
                }
            });
        } else {
            allCheckbox.checked = false;
        }
        filterContent();
    });
});

// Initial setup
initializeData();
loadFilters();
filterContent();
