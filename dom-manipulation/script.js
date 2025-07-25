let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let selectedCategory = localStorage.getItem("selectedCategory") || "all";
let lastViewedQuote = sessionStorage.getItem("lastViewedQuote") || "";

document.getElementById("addQuoteForm").addEventListener("submit", function (e) {
  e.preventDefault();
  addQuote();
});

function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (!text || !author || !category) return;

  quotes.push({ text, author, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("addQuoteForm").reset();
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    select.appendChild(option);
  });
}

function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayQuotes();
}

function displayQuotes() {
  const container = document.getElementById("quoteDisplay");
  container.innerHTML = "";

  let filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  filtered.forEach(q => {
    const div = document.createElement("div");
    div.textContent = `"${q.text}" - ${q.author} [${q.category}]`;
    container.appendChild(div);
  });
}

function showRandomQuote() {
  let filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (!filtered.length) return;

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  const container = document.getElementById("quoteDisplay");
  container.innerHTML = `"${random.text}" - ${random.author} [${random.category}]`;
  sessionStorage.setItem("lastViewedQuote", random.text);
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// === Simulated Server Sync ===
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();
    const mapped = serverQuotes.slice(0, 5).map(q => ({
      text: q.title,
      author: `User ${q.userId}`,
      category: "Server"
    }));

    const newOnes = mapped.filter(sq => !quotes.some(lq => lq.text === sq.text));
    if (newOnes.length > 0) {
      quotes.push(...newOnes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser(`${newOnes.length} new quote(s) fetched from server.`);
    }
  } catch (err) {
    console.error("Failed to sync with server:", err);
  }
}

function notifyUser(msg) {
  const note = document.getElementById("notification");
  note.textContent = msg;
  setTimeout(() => note.textContent = "", 4000);
}

// Initial load
populateCategories();
filterQuotes();
if (lastViewedQuote) notifyUser(`Last viewed quote: "${lastViewedQuote}"`);

// Periodic Sync every 30 seconds
setInterval(fetchQuotesFromServer, 30000);
