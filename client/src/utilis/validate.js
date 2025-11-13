// src/utilis/validate.js

// Returns a single error message string, or null if everything is valid.
export const checkValidData = (name, email, password) => {
  // Detect mode: if no name was provided, treat as LOGIN; otherwise SIGNUP.
  const isLogin = !name || String(name).trim() === "";

  const trimmedName = String(name || "").trim();
  const trimmedEmail = String(email || "").trim();
  const rawPassword = String(password || "");

  // Patterns
  const NAME_RE = /^[A-Za-z\s]+$/;                   // letters + spaces only
  const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const PASS_SIGNUP_RE = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/; // >=6, letter + number

  // Validate email (always)
  const isEmailValid = EMAIL_RE.test(trimmedEmail);
  if (!isEmailValid) return "Email ID is not valid.";

  // Validate password
  const isPasswordValid = isLogin
      ? rawPassword.length > 0
      : PASS_SIGNUP_RE.test(rawPassword);

  if (!isPasswordValid) {
    return isLogin
        ? "Please enter your password."
        : "Password must be at least 6 characters and include at least one letter and one number.";
  }

  // Validate name only on signup
  if (!isLogin) {
    const isNameValid = NAME_RE.test(trimmedName);
    if (!isNameValid) return "Full name can contain letters and spaces only.";
  }

  return null; // ✅ all good
};
