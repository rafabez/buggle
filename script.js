const messageHistory = [];

async function fetchSearchResults(query) {
  // Record query in message history
  messageHistory.push({ role: 'user', content: query });

  console.log("API call initiated with query:", query);
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content:
            'You are a search engine assistant that searches the Web and delivers the most relevant results.',
        },
        ...messageHistory,
      ],
      seed: Math.floor(Math.random() * 1000),
      model: 'searchgpt',
    }),
  });

  console.log("Response status:", response.status, "Headers:", response.headers);

  if (!response.ok) {
    console.error(
      "API call failed with status:",
      response.status,
      "and response:",
      await response.text()
    );
    return;
  }

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { choices: [{ message: { content: await response.text() } }] };
  }

  // Record system response in message history
  if (data.choices && data.choices[0] && data.choices[0].message.content) {
    messageHistory.push({ role: "system", content: data.choices[0].message.content });
  }

  console.log("API response data:", data);

  const buttons = document.querySelector('.buttons');
  if (buttons) {
    buttons.style.display = 'none';
  }
  displayResults(data);
}

function displayResults(data) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (data && data.choices && data.choices.length > 0) {
    let choiceContent = data.choices[0].message.content.trim();
    choiceContent = choiceContent.replace(/Powered by Pollinations\.ai and SearchGPT/g, "")
                                 .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Convert **text** to bold
    const resultsHTML = choiceContent.split("\n").reduce((html, line) => {
      const linkRegex = /\[(.*?)\]\((.*?)\)/; // Match [Title](URL)
      const match = line.match(linkRegex);
      if (match) {
        const title = match[1]; // Extract title (inside [])
        const url = match[2]; // Extract URL (inside ())
        html += `<p><a href="${url}" target="_blank">${title}</a></p>`; // Add clickable link
      } else if (line.trim()) {
        html += `<p>${line}</p>`; // Add non-blank content
      }
      return html;
    }, "");

    if (resultsHTML) {
      const resultDiv = document.createElement("div");
      resultDiv.className = "result-group";
      resultDiv.innerHTML = resultsHTML;
      resultsContainer.appendChild(resultDiv);

      // Add footer
      const footer = document.createElement("div");
      footer.className = "results-footer";
      footer.style.fontSize = "small"; // Set small font size for the footer
      footer.style.marginTop = "10px";
      resultsContainer.appendChild(footer);
    }
  } else {
    resultsContainer.innerHTML = "<p>No results returned.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("show-results");
  const searchForm = document.querySelector(".search-bar");

  function handleSearchTrigger() {
    const searchInput = document.querySelector(".search-bar input");
    const query = searchInput.value.trim();
    if (query) {
      document.body.classList.add("loading-active");
      const searchingMessage = document.getElementById("searchingMessage");
      if (searchingMessage) {
        searchingMessage.textContent = "Searching the web with Buggle...";
      }
      fetchSearchResults("Search the web and find me the most relevant results for " + query).finally(() => {
        document.body.classList.remove("loading-active");
        document.body.classList.add("show-results");
        if (searchingMessage) {
          searchingMessage.textContent = "";
        }
      });
    }
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSearchTrigger();
  });

  const searchIcon = document.getElementById("search-icon");
  if (searchIcon) {
    searchIcon.addEventListener("click", handleSearchTrigger);
  }

  const buttons = document.querySelector(".buttons");
  if (buttons) {
    buttons.style.display = "block";
    const luckyButton = buttons.querySelector("button:nth-of-type(2)");
    if (luckyButton) {
      console.log("Lucky button found and event listener attached.");
      luckyButton.addEventListener("click", () => {
  console.log("Lucky button clicked in Buggle");
        document.body.classList.add("loading-active");
        const searchingMessage = document.getElementById("searchingMessage");
        if (searchingMessage) {
          searchingMessage.textContent = "Searching the web with Buggle...";
        }
        fetchSearchResults(
          "Search the web and find me the most relevant results for a random subject of your choice"
        ).finally(() => {
          document.body.classList.remove("loading-active");
          document.body.classList.add("show-results");
          if (searchingMessage) {
            searchingMessage.textContent = "";
          }
        });
      });
    } else {
      console.error("Lucky button not found within buttons.");
    }
  }
});
