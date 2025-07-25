let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It's not whether you get knocked down, it's whether you get up.", category: "Resilience" }
];

// Display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"<br><em>(${quote.category})</em></p>`;
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    textInput.value = "";
    categoryInput.value = "";
    showRandomQuote();
  } else {
    alert("Please fill in both fields.");
  }
}

// Build the form and buttons using JS
function createAddQuoteForm() {
  const app = document.getElementById("app");

  // Quote display
  const quoteDisplay = document.createElement("div");
  quoteDisplay.id = "quoteDisplay";
  app.appendChild(quoteDisplay);

  // Show New Quote button
  const showBtn = document.createElement("button");
  showBtn.id = "newQuote";
  showBtn.textContent = "Show New Quote";
  showBtn.addEventListener("click", showRandomQuote);
  app.appendChild(showBtn);

  // New Quote Form
  const form = document.createElement("div");
  form.style.marginTop = "20px";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";
  form.appendChild(textInput);

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  form.appendChild(categoryInput);

  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);
  form.appendChild(addBtn);

  app.appendChild(form);
}

// Initialize
window.onload = () => {
  createAddQuoteForm();
  showRandomQuote();
};
