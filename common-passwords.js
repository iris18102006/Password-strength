// A compact list of extremely common passwords used for quick client-side detection.
// This is not exhaustive — it's meant to catch the most obvious/weak choices instantly,
// without shipping a massive wordlist to the browser.

const COMMON_PASSWORDS = [
  "123456", "123456789", "12345678", "12345", "1234567", "1234567890",
  "qwerty", "password", "password1", "password123", "111111", "123123",
  "abc123", "qwerty123", "1q2w3e4r", "admin", "letmein", "welcome",
  "monkey", "login", "starwars", "dragon", "football", "iloveyou",
  "sunshine", "master", "hello", "freedom", "whatever", "qazwsx",
  "trustno1", "654321", "jordan23", "harley", "ranger", "hunter",
  "buster", "soccer", "hockey", "killer", "george", "sexy",
  "andrew", "charlie", "superman", "asshole", "fuckyou", "121212",
  "flower", "hottie", "loveme", "jessica", "michael", "ninja",
  "mustang", "password!", "1234", "12345678910", "000000", "qwertyuiop",
  "1qaz2wsx", "zaq1zaq1", "passw0rd", "welcome1", "admin123", "root",
  "toor", "changeme", "letmein123", "default", "guest", "test"
];

function isCommonPassword(password) {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}
