# Password Security Analyzer

A professional, portfolio-ready password strength analyzer and secure password
generator — built with vanilla HTML, CSS, and JavaScript (no frameworks).

## Features

- **Live strength meter** with a 0–100 security score
- **Entropy calculation** based on character pool size and length
- **Crack time estimation** (instant → longer than the age of the universe)
- **Security report** checking length, character variety, common-password
  usage, and repeated/predictable patterns
- **Smart common-password detection** against a ~10,000-entry wordlist that
  also catches leetspeak swaps (`p@ssw0rd`) and base word + junk suffixes
  (`Password1!`, `welcome2024`)
- **Live, personalized suggestions** as you type
- **Have I Been Pwned integration** using the official k-anonymity API — only
  the first 5 characters of your password's SHA-1 hash are ever sent over the
  network, so your real password never leaves the browser
- **Secure password generator** using `crypto.getRandomValues` (not
  `Math.random`) with rejection sampling (no modulo bias), adjustable length,
  and a guarantee that every selected character type actually appears
- **Copy to clipboard** and **show/hide password** toggle
- Clean, GitHub/Vercel-inspired UI — no gradients, no glow effects, no emojis

## Project Structure

```
Password-Strength-Analyzer/
├── index.html            # Markup / layout
├── style.css             # Theme and styling
├── script.js             # Core logic (entropy, scoring, generator, HIBP check)
├── common-passwords.js   # ~10k common-password list + leetspeak/suffix matching
├── LICENSE
├── .gitignore
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

## How scoring works

The 0–100 score is entropy (up to 60 points) plus rule compliance (up to 40
points). If the password is on the common list, the score is capped at 25,
because the entropy formula can't tell `Password1!` is a terrible password.
All the numbers live in `SCORE_CONFIG` at the top of the scoring section in
`script.js`, so they're easy to tune.

## Notes for extending this project

- Want even stronger detection? Swap in a bigger wordlist (100k+) in
  `common-passwords.js`. It's a `Set`, so lookups stay instant.
- Tweak `SCORE_CONFIG` in `script.js` to change how heavily entropy vs.
  rule-compliance affects the final score.
- Everything runs client-side except the optional HIBP breach check.

## Credits

Common-password list derived from
[SecLists](https://github.com/danielmiessler/SecLists) (`10k-most-common`).
