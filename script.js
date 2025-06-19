// 設定變數
let apiKey = "";

// Summary length instructions
const lengthInstructions = {
  short:
    "Please summarize the following text into a concise 50-100 word summary",
  medium:
    "Please summarize the following text into a medium-length 100-200 word summary",
  long: "Please summarize the following text into a detailed 200-300 word summary",
};

// Main function to generate summary
async function summarizeText() {
  // Get input values
  apiKey = document.getElementById("apiKey").value.trim();
  const inputText = document.getElementById("inputText").value.trim();
  const summaryLength = document.getElementById("summaryLength").value;

  // Validate inputs
  if (!apiKey) {
    showError("Please enter your OpenAI API Key");
    return;
  }

  if (!inputText) {
    showError("Please enter text to summarize");
    return;
  }

  if (inputText.length < 100) {
    showError("Text too short. Please enter at least 100 characters");
    return;
  }

  // Show loading state
  showLoading(true);
  hideError();
  hideResult();

  try {
    // Call OpenAI API
    const summary = await callOpenAI(inputText, summaryLength);

    // Show result
    showResult(summary, inputText.length);
  } catch (error) {
    console.error("Error:", error);
    showError("Summary generation failed: " + error.message);
  } finally {
    showLoading(false);
  }
}

// Call OpenAI API
async function callOpenAI(text, length) {
  const instruction = lengthInstructions[length];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional text summarization assistant. Please provide accurate and readable summaries.",
        },
        {
          role: "user",
          content: `${instruction}:\n\n${text}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Show result
function showResult(summary, originalLength) {
  document.getElementById("summaryResult").textContent = summary;
  document.getElementById("originalLength").textContent =
    `Original: ${originalLength} chars`;
  document.getElementById("summaryStats").textContent =
    `Summary: ${summary.length} chars (${Math.round((1 - summary.length / originalLength) * 100)}% compression)`;
  document.getElementById("resultContainer").classList.add("show");
}

// Copy result to clipboard
function copyResult() {
  const summaryText = document.getElementById("summaryResult").textContent;
  navigator.clipboard.writeText(summaryText).then(() => {
    const btn = document.querySelector(".copy-btn");
    const originalText = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

// Show/hide loading state
function showLoading(show) {
  document.getElementById("loadingDiv").style.display = show ? "block" : "none";
  document.querySelector(".summarize-btn").disabled = show;
}

// Show error message
function showError(message) {
  document.getElementById("errorDiv").textContent = message;
  document.getElementById("errorDiv").style.display = "block";
}

// Hide error message
function hideError() {
  document.getElementById("errorDiv").style.display = "none";
}

// Hide result
function hideResult() {
  document.getElementById("resultContainer").classList.remove("show");
}

// Page initialization
document.addEventListener("DOMContentLoaded", function () {
  // Optional: Add some example text
  const exampleText = `Artificial Intelligence (AI) is rapidly transforming our world. From autonomous vehicles to medical diagnosis, AI technology is playing important roles across various fields. Machine learning algorithms can process vast amounts of data and discover patterns that humans might overlook. However, AI development also brings challenges, including changes in the job market, privacy concerns, and ensuring fairness and transparency in AI systems. In the future, we need to promote AI innovation while also paying attention to its impact on society, developing appropriate policies and regulations to guide AI development.`;

  // Optional: Set example text
  // document.getElementById('inputText').value = exampleText;
});
