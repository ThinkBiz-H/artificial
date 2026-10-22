/**
 * Turns user input into a literal-match regex source, capped in length, so
 * search terms can't inject regex syntax (e.g. catastrophic `(a+)+$`).
 */
const escapeRegex = (value, maxLength = 100) =>
  String(value ?? "")
    .slice(0, maxLength)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
