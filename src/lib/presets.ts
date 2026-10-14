import type { Mode } from "./regex";
export type Preset = {
  id: string;
  name: string;
  category: string;
  description: string;
  pattern: string;
  flags: string;
  text: string;
  explanation: string;
  mode?: Mode;
};
export const PRESETS: Preset[] = [
  {
    id: "email",
    name: "Email address",
    category: "Everyday",
    description: "Find common email addresses",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    text: "Hey there! You can reach me at hello@example.com\nor contact our team at support@regexlab.dev.\n\nThis one won't match: not-an-email@\nAnd here's another: alex.chen@company.co",
    explanation:
      "Finds common email addresses: a local name, an @ symbol, a domain, and a suffix of at least two letters. This practical pattern does not cover every valid email format or prove that an address exists.",
  },
  {
    id: "url",
    name: "Website URL",
    category: "Everyday",
    description: "Find links starting with http or https",
    pattern: "https?:\\/\\/[^\\s<>\"']+",
    flags: "g",
    text: "Read the docs at https://example.com/docs\nLocal dev: http://localhost:3000\nThis is not a link: example.com",
    explanation:
      "Finds text beginning with http:// or https:// and continuing until whitespace or a quote. It may include trailing punctuation; it does not verify URL validity.",
  },
  {
    id: "phone",
    name: "Phone number",
    category: "Everyday",
    description: "Find numbers in a US-style format",
    pattern: "\\b(?:\\d{3}[-. ]?)?\\d{3}[-. ]?\\d{4}\\b",
    flags: "g",
    text: "Call us at 415-555-0123\nOffice: 212.555.0199\nLocal: 5550123",
    explanation:
      "Finds seven- or ten-digit US-style phone numbers with optional separators. International dialing formats need a different pattern.",
  },
  {
    id: "date",
    name: "ISO date",
    category: "Data",
    description: "Find dates formatted YYYY-MM-DD",
    pattern: "\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b",
    flags: "g",
    text: "Created: 2026-10-14\nUpdated: 2026-11-02\nInvalid month: 2026-15-01",
    explanation:
      "Finds a four-digit year, a month from 01 to 12, and a day from 01 to 31. Captures year, month, and day separately. Calendar validation is still needed for dates such as February 31.",
  },
  {
    id: "ipv4",
    name: "IPv4 address",
    category: "Data",
    description: "Find dotted IPv4 addresses",
    pattern:
      "\\b(?:(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\b",
    flags: "g",
    text: "Server: 192.168.1.1\nLoopback: 127.0.0.1\nBad address: 999.999.999.999",
    explanation:
      "Finds four decimal numbers from 0 to 255 separated by dots. Leading zeros are excluded.",
  },
  {
    id: "hex",
    name: "Hex color",
    category: "Code",
    description: "Find three- or six-digit hex colors",
    pattern: "#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b",
    flags: "g",
    text: "Background: #14151a\nAccent: #a3e635\nWhite: #fff\nInvalid: #xyz",
    explanation:
      "Finds a # followed by three or six hexadecimal digits. Eight-digit colors with alpha are excluded.",
  },
  {
    id: "username",
    name: "Username",
    category: "Validation",
    description: "Validate a 3–20 character username",
    pattern: "[a-zA-Z][a-zA-Z0-9_]{2,19}",
    flags: "",
    mode: "validate",
    text: "alex_chen",
    explanation:
      "Requires the entire input to start with a letter, followed by 2 to 19 letters, digits, or underscores.",
  },
  {
    id: "password",
    name: "Password",
    category: "Validation",
    description: "Check basic password requirements",
    pattern: "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[^\\s]{8,}",
    flags: "",
    mode: "validate",
    text: "RegexLab2026",
    explanation:
      "Requires at least eight non-whitespace characters, including a lowercase letter, an uppercase letter, and a digit. This checks format, not password strength or breach status.",
  },
  {
    id: "number",
    name: "Decimal number",
    category: "Data",
    description: "Find signed whole or decimal numbers",
    pattern: "-?\\b\\d+(?:\\.\\d+)?\\b",
    flags: "g",
    text: "Price: 42.50\nTemperature: -12.3\nQuantity: 100",
    explanation:
      "Finds integers or decimals with an optional minus sign. It does not handle scientific notation or comma separators.",
  },
  {
    id: "slug",
    name: "URL slug",
    category: "Validation",
    description: "Validate lowercase words with hyphens",
    pattern: "[a-z0-9]+(?:-[a-z0-9]+)*",
    flags: "",
    mode: "validate",
    text: "my-first-blog-post",
    explanation:
      "Requires lowercase letters or digits, with single hyphens separating segments. Leading, trailing, and repeated hyphens are rejected.",
  },
];
