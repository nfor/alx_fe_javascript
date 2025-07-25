let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "To be or not to be.", category: "Philosophy" }
];

// Restore last filter
let lastFilter = localStorage.getItem("lastFilter") || "all";

// Show a random quote
function showRandomQuote() {
  const filtered = lastFilter === "all" ? quotes : quotes.filter(q => q.category === lastFilter);
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  document.getElementById("quoteDisplay").innerText = `"${quote.text}" - (${quote.category})`;

  // Save to sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Export quotes to JSON
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
        showRandomQuote();
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error reading the file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Populate category dropdown
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  const current = select.value;

  // Clear and repopulate
  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore selected value
  select.value = current || "all";
}

// Filter quotes by selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  lastFilter = selected;
  localStorage.setItem("lastFilter", selected);
  showRandomQuote();
}

// Event listener
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Init
populateCategories();
document.getElementById("categoryFilter").value = lastFilter;
showRandomQuote();
