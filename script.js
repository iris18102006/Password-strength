/* ============================================================
   Password Security Analyzer — Core Logic
   ============================================================ */

// ---------- DOM References ----------
const passwordInput = document.getElementById("password-input");
const toggleVisibilityBtn = document.getElementById("toggle-visibility");
const charCount = document.getElementById("char-count");
const securityScoreEl = document.getElementById("security-score");
const strengthText = document.getElementById("strength-text");
const strengthBarFill = document.getElementById("strength-bar-fill");
const entropyValue = document.getElementById("entropy-value");
const crackTimeValue = document.getElementById("crack-time-value");
const reportList = document.getElementById("report-list");
const suggestionsList = document.getElementById("suggestions-list");
const breachCheckBtn = document.getElementById("breach-check-btn");
const breachResult = document.getElementById("breach-result");

const generatedPasswordInput = document.getElementById("generated-password");
const copyBtn = document.getElementById("copy-btn");
const lengthSlider = document.getElementById("length-slider");
const lengthValue = document.getElementById("length-value");
const generateBtn = document.getElementById("generate-btn");

const optUppercase = document.getElementById("opt-uppercase");
const optLowercase = document.getElementById("opt-lowercase");
const optNumbers = document.getElementById("opt-numbers");
const optSymbols = document.getElementById("opt-symbols");

// ============================================================
// ENTROPY CALCULATION
// ============================================================
function calculateEntropy(password) {
  let pool = 0;

  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 33;

  if (pool === 0 || password.length === 0) return 0;

  return Math.round(password.length * Math.log2(pool));
}

// ============================================================
// CRACK TIME ESTIMATE
// ============================================================
function crackTimeLabel(entropy) {
  if (entropy === 0) return "Instantly";
  if (entropy < 28) return "Instantly";
  if (entropy < 36) return "A few minutes";
  if (entropy < 50) return "A few days";
  if (entropy < 65) return "Several years";
  if (entropy < 80) return "Centuries";
  if (entropy < 100) return "Millions of years";
  return "Longer than the age of the universe";
}

// ============================================================
// REPEATED CHARACTER CHECK
// e.g. "aaaa", "1111", "abcabcabc" style low-effort repetition
// ============================================================
function hasExcessiveRepeats(password) {
  if (/(.)\1{2,}/.test(password)) return true; // same char 3+ times in a row

  // check for simple repeating patterns like "abab" or "123123"
  for (let chunk = 1; chunk <= Math.floor(password.length / 2); chunk++) {
    const pattern = password.slice(0, chunk);
    const repeated = pattern.repeat(Math.floor(password.length / chunk));
    if (repeated.length >= 6 && password.startsWith(repeated)) return true;
  }
  return false;
}

// ============================================================
// RULE EVALUATION
// ============================================================
function evaluateRules(password) {
  return {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    common: !isCommonPassword(password),
    repeat: !hasExcessiveRepeats(password),
  };
}

// ============================================================
// SECURITY SCORE (0–100)
// Tweak SCORE_CONFIG to change how much entropy vs. rules matter.
// ============================================================
const SCORE_CONFIG = {
  entropyMaxPoints: 60,   // max points from entropy
  entropyCapBits: 100,    // entropy at which you get the full amount
  ruleWeights: {          // rules add up to 40 points
    length: 8,
    uppercase: 6,
    lowercase: 6,
    number: 6,
    symbol: 8,
    common: 4,
    repeat: 2,
  },
  // a common/breached-style password can never score above this
  commonPasswordCap: 25,
};

function calculateScore(password, rules, entropy) {
  if (password.length === 0) return 0;

  let score = 0;

  score += Math.min(
    SCORE_CONFIG.entropyMaxPoints,
    Math.round((entropy / SCORE_CONFIG.entropyCapBits) * SCORE_CONFIG.entropyMaxPoints)
  );

  Object.keys(SCORE_CONFIG.ruleWeights).forEach((key) => {
    if (rules[key]) score += SCORE_CONFIG.ruleWeights[key];
  });

  // Entropy math can't tell "Password1!" is trash, so cap it
  if (!rules.common) score = Math.min(score, SCORE_CONFIG.commonPasswordCap);

  return Math.max(0, Math.min(100, score));
}

// ============================================================
// STRENGTH LABEL + COLOR FROM SCORE
// ============================================================
function strengthFromScore(score) {
  if (score === 0) return { label: "—", color: "var(--weak)", percent: 0 };
  if (score < 30) return { label: "Very Weak", color: "var(--weak)", percent: score };
  if (score < 50) return { label: "Weak", color: "var(--weak)", percent: score };
  if (score < 70) return { label: "Moderate", color: "var(--moderate)", percent: score };
  if (score < 90) return { label: "Strong", color: "var(--strong)", percent: score };
  return { label: "Very Strong", color: "var(--strong)", percent: score };
}

// ============================================================
// SUGGESTIONS ENGINE
// ============================================================
function buildSuggestions(password, rules) {
  const suggestions = [];

  if (password.length === 0) {
    return ["Start typing to see personalized suggestions."];
  }

  if (!rules.length) suggestions.push("Increase password length to at least 12 characters.");
  if (!rules.symbol) suggestions.push("Add at least one special character (e.g. !, @, #, %).");
  if (!rules.uppercase) suggestions.push("Add an uppercase letter.");
  if (!rules.lowercase) suggestions.push("Add a lowercase letter.");
  if (!rules.number) suggestions.push("Add at least one number.");
  if (!rules.common) suggestions.push("Avoid using commonly known passwords.");
  if (!rules.repeat) suggestions.push("Avoid repeated or predictable character patterns.");

  suggestions.push("Do not reuse this password across other websites.");
  suggestions.push("Consider using a password manager to generate and store unique passwords.");

  return suggestions;
}

// ============================================================
// MAIN ANALYSIS / RENDER FUNCTION
// ============================================================
function analyzePassword() {
  const password = passwordInput.value;
  const rules = evaluateRules(password);
  const entropy = calculateEntropy(password);
  const score = calculateScore(password, rules, entropy);
  const strength = strengthFromScore(score);

  // Character count
  charCount.textContent = `${password.length} character${password.length === 1 ? "" : "s"}`;

  // Score
  securityScoreEl.textContent = `Score: ${score}/100`;

  // Strength bar
  strengthText.textContent = strength.label;
  strengthBarFill.style.width = `${strength.percent}%`;
  strengthBarFill.style.background = strength.color;

  // Entropy + crack time
  entropyValue.textContent = `${entropy} bits`;
  crackTimeValue.textContent = crackTimeLabel(entropy);

  // Report list
  [...reportList.children].forEach((li) => {
    const rule = li.dataset.rule;
    if (rules[rule]) {
      li.classList.add("passed");
    } else {
      li.classList.remove("passed");
    }
  });

  // Suggestions
  const suggestions = buildSuggestions(password, rules);
  suggestionsList.innerHTML = suggestions.map((s) => `<li>${s}</li>`).join("");

  // Reset breach result whenever password changes
  breachResult.textContent = "";
  breachResult.className = "breach-result";
}

passwordInput.addEventListener("input", analyzePassword);

// ============================================================
// SHOW / HIDE PASSWORD
// ============================================================
toggleVisibilityBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  toggleVisibilityBtn.textContent = isPassword ? "Hide" : "Show";
});

// ============================================================
// HAVE I BEEN PWNED — K-ANONYMITY BREACH CHECK
// ============================================================
async function sha1Hex(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function checkPwned(password) {
  if (!password) {
    breachResult.textContent = "Enter a password first.";
    breachResult.className = "breach-result";
    return;
  }

  breachResult.textContent = "Checking…";
  breachResult.className = "breach-result";

  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) throw new Error("API request failed");

    const text = await response.text();
    const lines = text.split("\n");

    let matchCount = 0;
    for (const line of lines) {
      const [suffixCandidate, count] = line.trim().split(":");
      if (suffixCandidate === suffix) {
        matchCount = parseInt(count, 10);
        break;
      }
    }

    if (matchCount > 0) {
      breachResult.textContent = `This password has appeared in ${matchCount.toLocaleString()} known data breaches. Do not use it.`;
      breachResult.className = "breach-result breached";
    } else {
      breachResult.textContent = "This password was not found in any known breach database.";
      breachResult.className = "breach-result safe";
    }
  } catch (err) {
    breachResult.textContent = "Could not reach the breach database. Check your connection and try again.";
    breachResult.className = "breach-result";
  }
}

breachCheckBtn.addEventListener("click", () => checkPwned(passwordInput.value));

// ============================================================
// PASSWORD GENERATOR
// ============================================================
const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}",
};

// Unbiased random int in [0, max) using rejection sampling,
// so "% pool.length" can't favor the first few characters.
function secureRandomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function generatePassword(length, options) {
  const selected = Object.keys(CHAR_SETS).filter((k) => options[k]);
  // fallback so we never generate an empty password
  if (selected.length === 0) selected.push("lowercase");

  const pool = selected.map((k) => CHAR_SETS[k]).join("");

  // one guaranteed char from each selected set (if length allows)...
  const chars = [];
  selected.slice(0, length).forEach((k) => {
    chars.push(CHAR_SETS[k][secureRandomInt(CHAR_SETS[k].length)]);
  });

  // ...rest from the full pool
  while (chars.length < length) {
    chars.push(pool[secureRandomInt(pool.length)]);
  }

  // Fisher-Yates shuffle so the guaranteed chars aren't always up front
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

lengthSlider.addEventListener("input", () => {
  lengthValue.textContent = lengthSlider.value;
});

generateBtn.addEventListener("click", () => {
  const length = parseInt(lengthSlider.value, 10);
  const options = {
    uppercase: optUppercase.checked,
    lowercase: optLowercase.checked,
    numbers: optNumbers.checked,
    symbols: optSymbols.checked,
  };

  const password = generatePassword(length, options);
  generatedPasswordInput.value = password;
});

// ============================================================
// COPY TO CLIPBOARD
// ============================================================
copyBtn.addEventListener("click", async () => {
  if (!generatedPasswordInput.value) return;

  try {
    await navigator.clipboard.writeText(generatedPasswordInput.value);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1500);
  } catch (err) {
    // Fallback for older browsers
    generatedPasswordInput.select();
    document.execCommand("copy");
  }
});

// ============================================================
// INITIAL RENDER
// ============================================================
analyzePassword();
