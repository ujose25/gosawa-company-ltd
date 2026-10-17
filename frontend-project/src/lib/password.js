export function isStrongPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export const PASSWORD_HINT =
  "Use at least 10 characters, including uppercase and lowercase letters, a number, and a symbol.";
