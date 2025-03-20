import { toJpeg } from "html-to-image";

// DOM Elements
const elements = {
  quote: document.querySelector("#quote"),
  author: document.querySelector("#author"),
  wrapper: document.querySelector("#quote-wrapper"),
  card: document.querySelector("#quote-card"),
  cardBackground: document.querySelector("#background-image-container"),
  newQuoteBtn: document.querySelector("#new-quote"),
  copyQuoteBtn: document.querySelector("#copy-quote"),
  tweetQuoteBtn: document.querySelector("#tweet-quote"),
  downloadQuoteBtn: document.querySelector("#download-quote"),
  fetchIcon: document.querySelector("#fetch_icon"),
};

// Configuration
const config = {
  apiEndpoint: "https://api.freeapi.app/api/v1/public/quotes/quote/random",
  downloadOptions: {
    quality: 0.95,
  },
};

/**
 * Toggle loading animation and disable/enable buttons
 */
function toggleLoadingAnimation(isLoading) {
  elements.fetchIcon.classList.toggle("animate-spin", isLoading);
  const buttons = [
    elements.newQuoteBtn,
    elements.copyQuoteBtn,
    elements.tweetQuoteBtn,
    elements.downloadQuoteBtn,
  ];
  buttons.forEach((btn) => btn?.toggleAttribute("disabled", isLoading));

  if (isLoading) {
    elements.quote.textContent = "Loading Quote...";
    elements.author.textContent = "";
  }
}

/**
 * Log and display an error message
 */
function showError(message) {
  console.error(message);
}

/**
 * Copy quote to Clipboard
 */
async function copyQuote() {
  if (!navigator.clipboard) {
    showError("Clipboard API not available");
    return;
  }

  try {
    const text = `${elements.quote.textContent} ${elements.author.textContent}`;
    elements.copyQuoteBtn.setAttribute("disabled", "disabled");
    await navigator.clipboard.writeText(text);
  } catch (error) {
    showError(`Error copying text: ${error}`);
  } finally {
    elements.copyQuoteBtn.removeAttribute("disabled");
  }
}

/**
 * Fetch a random quote from the API
 */
async function fetchQuote() {
  try {
    const response = await fetch(config.apiEndpoint);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    showError(`Failed to fetch quote: ${error}`);
    return null;
  }
}

/**
 * Fetch a random background image
 */
async function fetchBackground() {
  try {
    const response = await fetch("https://picsum.photos/800/500");
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    return response.url;
  } catch (error) {
    showError(`Failed to fetch background: ${error}`);
    return null;
  }
}

/**
 * Fetch both quote and background in parallel
 */
async function fetchData() {
  toggleLoadingAnimation(true);
  try {
    const [quote, background] = await Promise.all([
      fetchQuote(),
      fetchBackground(),
    ]);
    return { quote, background };
  } catch (error) {
    showError(`Error fetching data: ${error}`);
    return { quote: null, background: null };
  } finally {
    toggleLoadingAnimation(false);
  }
}

/**
 * Update the UI with a new quote and background
 */
async function updateQuote() {
  const { quote, background } = await fetchData();

  if (quote) {
    elements.quote.textContent = quote.content || "No quote available";
    elements.author.textContent = quote.author
      ? `― ${quote.author}`
      : "― Unknown";
  }

  if (background) {
    elements.cardBackground.style.backgroundImage = `url(${background})`;
  }
}

/**
 * Download the quote card as an image
 */
async function downloadQuote() {
  const dataUrl = await toJpeg(elements.card, config.downloadOptions);
  try {
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `inspirational-quote-${timestamp}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    showError(`Error generating image: ${error}`);
  }
}

/**
 * Share the current quote on Twitter
 */
function shareOnTwitter() {
  const text = `"${elements.quote.textContent}" ${elements.author.textContent}`;
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

/**
 * Attach event listeners efficiently
 */
function attachEventListeners() {
  const events = [
    { element: "newQuoteBtn", handler: updateQuote },
    { element: "copyQuoteBtn", handler: copyQuote },
    { element: "tweetQuoteBtn", handler: shareOnTwitter },
    { element: "downloadQuoteBtn", handler: downloadQuote },
  ];

  events.forEach(({ element, handler }) => {
    elements[element]?.addEventListener("click", debounce(handler, 300));
  });
}

/**
 * Debounce function to prevent multiple rapid clicks
 */
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Initialize the application
 */
function init() {
  attachEventListeners();
  updateQuote();
}

document.addEventListener("DOMContentLoaded", init);
