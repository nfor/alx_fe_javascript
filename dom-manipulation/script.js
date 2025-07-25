let quotes = [];
let selectedCategory = localStorage.getItem("lastFilter") || "all";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // simulate quotes

// Local storage functions
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [];
}

// Display filtering and random quote
function showNewQuote() {
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);
  const display = document.getElementById("quoteDisplay");
  if (!filtered.length) {
    display.textContent = "No quotes in this category.";
    return;
  }
  const q = filtered[Math.floor(Math.random() * filtered.length)];
  display.textContent = `"${q.text}" [${q.category}]`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(q));
}

// Add new quote
function addQuote(e) {
  e.preventDefault();
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();
  if (!text || !category) {
    alert("Fill both fields.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showNewQuote();
  e.target.reset();
}

// Populate categories dropdown
function populateCategories() {
  const set = new Set(["all"]);
  quotes.forEach(q => set.add(q.category));
  const sel = document.getElementById("categoryFilter");
  sel.innerHTML = "";
  set.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    sel.appendChild(opt);
  });
  sel.value = selectedCategory;
}

// Filter quotes
function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selectedCategory);
  showNewQuote();
}

// Import/Export
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error();
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      showNewQuote();
      alert("Imported successfully.");
    } catch {
      alert("Invalid file.");
    }
  };
  reader.readAsText(file);
}

// --- SERVER SYNC LOGIC ---

async function fetchServerQuotes() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    return data.map(item => ({
      text: item.title,
      category: "server" 
    }));
  } catch {
    console.log("Fetch error");
    return [];
  }
}

async function syncWithServer() {
  const server = await fetchServerQuotes();
  let changed = false;
  server.forEach(sq => {
    const exists = quotes.some(q => q.text === sq.text);
    if (!exists) {
      quotes.push(sq);
      changed = true;
    }
  });
  if (changed) {
    saveQuotes();
    populateCategories();
    document.getElementById("syncStatus").textContent =
      "Quotes synced with server (server wins on conflict).";
  } else {
    document.getElementById("syncStatus").textContent = 
      "No new quotes from server.";
  }
}

// Start periodic server sync
setInterval(syncWithServer, 60000); // every 60 seconds

// Init on load
window.onload = () => {
  loadQuotes();
  populateCategories();
  showNewQuote();
  document.getElementById("quoteForm").addEventListener("submit", addQuote);
  syncWithServer();
};
