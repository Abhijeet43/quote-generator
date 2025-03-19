import { toPng } from "html-to-image";

// DOM Elements
const elements = {
  quote: document.querySelector("#quote"),
  author: document.querySelector("#author"),
  wrapper: document.querySelector("#quote-wrapper"),
  card: document.querySelector("#quote-card"),
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
    backgroundColor: "#ffffff",
  },
  gradients: [
    "bg-gradient-to-r from-blue-500 to-purple-500",
    "bg-gradient-to-r from-green-400 to-teal-500",
    "bg-gradient-to-r from-orange-400 to-red-500",
    "bg-gradient-to-r from-indigo-500 to-cyan-500",
    "bg-gradient-to-r from-gray-700 to-black",
    "bg-gradient-to-r from-pink-500 to-rose-500",
    "bg-gradient-to-r from-fuchsia-500 to-violet-500",
    "bg-gradient-to-r from-lime-400 to-emerald-500",
    "bg-gradient-to-r from-yellow-400 to-orange-500",
    "bg-gradient-to-r from-teal-400 to-blue-500",
  ],
};

/**
 * Toggle loading animation
 */
function toggleLoadingAnimation(isLoading) {
  if (isLoading) {
    elements.fetchIcon.classList.add("animate-spin");
  } else {
    elements.fetchIcon.classList.remove("animate-spin");
  }
}

/**
 * Display an error message
 */
function showError(message) {
  console.error(message);
}

/**
 * Copy quote to Clipboard
 */
async function copyQuote(message) {
  if (!navigator.clipboard) {
    showError("Clipboard API not available");
    return;
  }
  try {
    elements.copyQuoteBtn.setAttribute("disabled", "disabled");
    await navigator.clipboard.writeText(message);
  } catch (error) {
    showError(
      `There was error copying the text: ${text} to clipboard, ${error}`
    );
  } finally {
    elements.copyQuoteBtn.removeAttribute("disabled");
  }
}

function handleCopyQuote() {
  copyQuote(`${elements.quote.textContent} ${elements.author.textContent}`);
}

/**
 * Fetch a random quote from the API
 */
async function fetchQuote() {
  try {
    elements.newQuoteBtn.setAttribute("disabled", "disabled");
    toggleLoadingAnimation(true);

    const response = await fetch(config.apiEndpoint);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return data?.data || null;
  } catch (error) {
    console.error("Failed to fetch quote:", error);
    showError("Couldn't fetch a new quote. Please try again later.");
    return null;
  } finally {
    elements.newQuoteBtn.removeAttribute("disabled");
    toggleLoadingAnimation(false);
  }
}

/**
 * Get a random gradient from the available options
 */
function getRandomGradient() {
  const randomIndex = Math.floor(Math.random() * config.gradients.length);
  return config.gradients[randomIndex];
}

/**
 * Update background gradients on the UI
 */
function updateBackgrounds() {
  const randomGradient = getRandomGradient();
  const gradientClasses = randomGradient.split(" ");

  // Helper function to remove existing gradient classes
  function removeGradientClasses(element) {
    if (!element) return;

    element.classList.forEach((cls) => {
      if (
        cls.startsWith("bg-gradient-to") ||
        cls.startsWith("from-") ||
        cls.startsWith("to-")
      ) {
        element.classList.remove(cls);
      }
    });
  }

  // Apply new gradient to wrapper
  removeGradientClasses(elements.wrapper);
  elements.wrapper.classList.add(...gradientClasses);

  // Apply new gradient to button
  removeGradientClasses(elements.newQuoteBtn);
  elements.newQuoteBtn.classList.add(...gradientClasses);
}

/**
 * Update the quote and author on the UI
 */
async function updateQuote() {
  const quoteData = await fetchQuote();

  if (quoteData) {
    elements.quote.textContent = quoteData.content || "No quote available";
    elements.author.textContent = quoteData.author
      ? `― ${quoteData.author}`
      : "― Unknown";
    updateBackgrounds();
  }
}

/**
 * Download the quote card as an image
 */
async function downloadQuote() {
  try {
    const dataUrl = await toPng(elements.card, config.downloadOptions);

    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `inspirational-quote-${timestamp}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Error generating image:", err);
    showError("Could not download the quote. Please try again.");
  }
}

/**
 * Share the current quote on Twitter
 */
function shareOnTwitter() {
  const quoteText = elements.quote.textContent;
  const authorText = elements.author.textContent;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `"${quoteText}" ${authorText}`
  )}`;

  window.open(twitterUrl, "_blank", "noopener,noreferrer");
}

/**
 * Initialize the application
 */
function init() {
  elements.newQuoteBtn.addEventListener("click", updateQuote);
  elements.copyQuoteBtn.addEventListener("click", handleCopyQuote);
  elements.tweetQuoteBtn.addEventListener("click", shareOnTwitter);
  elements.downloadQuoteBtn.addEventListener("click", downloadQuote);

  updateQuote();
}

// Initialize the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", init);
