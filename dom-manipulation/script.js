let quotes = [];
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

const quotesList = document.getElementById("quotesList");
const categoryFilter = document.getElementById("categoryFilter");
const conflictMessage = document.getElementById("conflictMessage");

document.getElementById("addQuoteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  addQuote();
});

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = JSON.parse(localStorage.getItem("quotes"));
  if (storedQuotes) {
    quotes = storedQuotes;
  }
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = selectedCategory;
}

function displayQuotes() {
  quotesList.innerHTML = "";
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  filtered.forEach(q => {
    const li = document.createElement("li");
    li.textContent = `"${q.text}" - ${q.author} [${q.category}]`;
    quotesList.appendChild(li);
  });
}

function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && author && category) {
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    displayQuotes();
    syncQuoteToServer(newQuote);

    document.getElementById("addQuoteForm").reset();
  }
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayQuotes();
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      displayQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Simulated Server Sync (JSONPlaceholder-like) ---

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock

function fetchQuotesFromServer() {
  fetch(SERVER_URL)
    .then(res => res.json())
    .then(serverQuotes => {
      // Simulate a quote structure
      const parsed = serverQuotes.slice(0, 5).map(post => ({
        text: post.title,
        author: `Author ${post.userId}`,
        category: "Server"
      }));

      let hasConflict = false;
      parsed.forEach(serverQuote => {
        const exists = quotes.some(q => q.text === serverQuote.text && q.author === serverQuote.author);
        if (!exists) {
          quotes.push(serverQuote);
          hasConflict = true;
        }
      });

      if (hasConflict) {
        conflictMessage.textContent = "New quotes synced from server.";
        conflictMessage.style.display = "block";
        saveQuotes();
        populateCategories();
        displayQuotes();
      }
    })
    .catch(() => {
      console.warn("Server fetch failed");
    });
}

function syncQuoteToServer(quote) {
  fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  }).then(res => res.json())
    .then(() => {
      console.log("Synced to server");
    })
    .catch(() => {
      console.warn("Sync failed");
    });
}

// --- Initialize ---
loadQuotes();
populateCategories();
displayQuotes();
fetchQuotesFromServer();
setInterval(fetchQuotesFromServer, 15000); // fetch every 15s
