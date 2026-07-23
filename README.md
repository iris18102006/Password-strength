# Password Security Analyzer

A professional, portfolio-ready password strength analyzer and secure password
generator — built with vanilla HTML, CSS, and JavaScript (no frameworks).

## Features

- **Live strength meter** with a 0–100 security score
- **Entropy calculation** based on character pool size and length
- **Crack time estimation** (instant → longer than the age of the universe)
- **Security report** checking length, character variety, common-password
  usage, and repeated/predictable patterns
- **Live, personalized suggestions** as you type
- **Have I Been Pwned integration** using the official k-anonymity API — only
  the first 5 characters of your password's SHA-1 hash are ever sent over the
  network, so your real password never leaves the browser
- **Secure password generator** using `crypto.getRandomValues` (not
  `Math.random`), with adjustable length and character set options
- **Copy to clipboard** and **show/hide password** toggle
- Clean, GitHub/Vercel-inspired UI — no gradients, no glow effects, no emojis

## Project Structure

```
Password-Strength-Analyzer/
├── index.html          # Markup / layout
├── style.css            # Theme and styling
├── script.js             # Core logic (entropy, scoring, generator, HIBP check)
├── common-passwords.js   # Small local wordlist for instant common-password detection
└── README.md
```

## Running it

No build step needed. Just open `index.html` in a browser.

If you want the "Check Have I Been Pwned Database" button to work, you need
an internet connection — it calls `https://api.pwnedpasswords.com`, which is a
free public API and requires no key.

## How the entropy math works

```
entropy_bits = password_length × log2(character_pool_size)
```

Where `character_pool_size` adds up based on which character types are present:

| Character type | Pool size |
|---|---|
| lowercase | 26 |
| uppercase | 26 |
| numbers | 10 |
| symbols | 33 |

This is a standard, widely-used approximation of password entropy — it's not
a perfect model of real-world guessability (it doesn't know that
`Password1!` is a dictionary word with predictable substitutions), which is
exactly why the common-password list and repeat-pattern checks exist
alongside it.

## Notes for extending this project

- Swap the local common-password list for a larger wordlist (e.g. the
  top 10,000 or 100,000 most common passwords) if you want stronger detection.
- The scoring weights in `calculateScore()` are tunable — adjust them to
  change how heavily entropy vs. rule-compliance affects the final score.
- Everything runs client-side except the optional HIBP breach check.
