document.addEventListener("DOMContentLoaded", () => {
  // 1. Scroll-based fade in using Intersection Observer
  const sections = document.querySelectorAll(".fade-section");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "fadeUp 1.2s ease-out forwards";
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(section => {
      section.style.opacity = 0;
      observer.observe(section);
    });
  }

  // 2. Card toggle on click
  document.querySelectorAll(".card").forEach(card =>
    card.addEventListener("click", () => card.classList.toggle("active"))
  );

  // 3. Load voices for speech synthesis with fallback
  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    window.selectedVoice =
      voices.find(v => /Google US English/i.test(v.name)) ||
      voices.find(v => /Microsoft Aria/i.test(v.name)) ||
      voices.find(v => /Samantha/i.test(v.name)) ||
      voices.find(v => v.lang === "en-US" && v.localService) ||
      voices[0] || null;
  }
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  // 4. FRIDAY Assistant panel toggle
  const toggleBtn = document.getElementById("friday-toggle");
  const fridayPanel = document.getElementById("friday-panel");
  if (toggleBtn && fridayPanel) {
    toggleBtn.addEventListener("click", () => {
      fridayPanel.style.display = (fridayPanel.style.display === "flex") ? "none" : "flex";
    });
  }

  // 5. Handle Enter key on user input for chat
  const userInput = document.getElementById("userInput");
  if (userInput) {
    userInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleQuery();
      }
    });
  }

  // 6. Send button for chat
  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) {
    sendBtn.addEventListener("click", () => handleQuery());
  }

  // 7. Speech input button for chat (mic)
  const micBtn = document.getElementById("micBtn");
  if (micBtn) {
    micBtn.addEventListener("click", () => startListening());
  }

  // 8. Search functionality
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  if (searchBtn && searchInput) {
    // Click handler
    searchBtn.addEventListener("click", () => {
      performSearch(searchInput.value);
    });
    // Also allow Enter key on search input to trigger search
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch(searchInput.value);
      }
    });
  }

  // 9. Animate the title characters with delay
  const title = document.getElementById("animatedTitle");
  if (title) {
    const text = title.textContent.trim();
    title.innerHTML = text.split('').map((ch, i) =>
      `<span class="char" style="animation-delay:${(i * 0.1).toFixed(2)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
  }
});

// Speak function with volume and voice
function speak(text) {
  const volumeControl = document.getElementById("volumeControl");
  const volume = volumeControl ? parseFloat(volumeControl.value) : 1;
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = window.selectedVoice || null;
  utter.volume = isNaN(volume) ? 1 : volume;
  utter.rate = Math.random() < 0.5 ? 1.1 : 0.95;
  utter.pitch = Math.random() < 0.5 ? 1.2 : 0.9;
  utter.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// Typewriter effect for AI replies
function typeReply(text, element, delay = 30) {
  element.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i++);
    } else {
      clearInterval(interval);
    }
  }, delay);
}

// Handle user query for chat
async function handleQuery() {
  const inputElem = document.getElementById("userInput");
  const input = inputElem?.value.trim();
  if (!input) return;

  const chatbox = document.getElementById("chatbox");

  // Show user message
  const userMsg = document.createElement("p");
  userMsg.textContent = "🧑 " + input;
  chatbox.appendChild(userMsg);

  // AI reply container
  const aiMsg = document.createElement("p");
  aiMsg.classList.add("ai-msg");
  aiMsg.textContent = "🤖 ";
  chatbox.appendChild(aiMsg);

  try {
    const summary = await fetchWikiSummary(input);
    typeReply(summary, aiMsg);
    speak(summary);
  } catch {
    const errorMsg = "Sorry, I couldn't find info on that.";
    aiMsg.textContent += errorMsg;
    speak(errorMsg);
  }

  inputElem.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Fetch summary extract from Wikipedia REST API
async function fetchWikiSummary(query) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("No Wikipedia article found");
  const data = await response.json();
  return data.extract || "No summary available.";
}

// Start speech recognition for voice input
function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Browser doesn't support voice input.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    const inputElem = document.getElementById("userInput");
    if (inputElem) {
      inputElem.value = transcript;
      handleQuery();
    }
  };

  recognition.onerror = event => {
    alert("Mic error: " + event.error);
  };

  recognition.start();
}

// Search function with redirect logic
function performSearch(query) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    alert("Please enter a search term.");
    return;
  }
  if (cleanQuery.includes("marvel")) {
    window.location.href = "marvel.html";
  } else if (cleanQuery.includes("dc")) {
    window.location.href = "dcu.html";
  } else if (["monster", "godzilla", "kong"].some(term => cleanQuery.includes(term))) {
    window.location.href = "monstervers.html";
  } else {
    alert("No results found. Try searching for Marvel, DC, or MonsterVerse.");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("friday-toggle");
  const fridayPanel = document.getElementById("friday-panel");

  toggleBtn.addEventListener("click", () => {
    fridayPanel.classList.toggle("show");
  });
});
function showSection(type) {
  document.getElementById("selection-screen").style.display = "none";

  if (type === 'heroes') {
    document.getElementById("hero-sections").style.display = "block";
  } else if (type === 'villains') {
    document.getElementById("villain-sections").style.display = "block";
  }
}