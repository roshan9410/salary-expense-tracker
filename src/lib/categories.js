export const CATEGORIES = [
  ['food', 'Food & groceries', '🍛', '#4388e8'], ['rent', 'Rent / housing', '🏠', '#19a66a'],
  ['transport', 'Transport / petrol', '🛵', '#9462d8'], ['utilities', 'Utilities', '💡', '#f2ad36'],
  ['phone', 'Phone & internet', '📱', '#20aaa3'], ['health', 'Health & medicine', '🏥', '#e95768'],
  ['education', 'Education & courses', '🎓', '#5b6fd6'], ['shopping', 'Shopping & clothes', '🛍️', '#e58b52'],
  ['fun', 'Entertainment', '🍿', '#c764b5'], ['snacks', 'Snacks & tea', '☕', '#a47551'],
  ['emi', 'EMI / loan', '🚲', '#7a8aa3'], ['savings', 'Savings / investment', '💰', '#2fb36e'],
  ['family', 'Family / personal', '👨‍👩‍👧', '#d9798f'], ['gifts', 'Gifts & donations', '🎁', '#e0a030'],
  ['travel', 'Travel', '🧳', '#3a9bd5'], ['pets', 'Pets', '🐾', '#8d6e63'],
  ['fees', 'Fees & taxes', '🧾', '#6b7a90'], ['misc', 'Miscellaneous', '📦', '#b6c1d0'],
].map(([key, label, emoji, color]) => ({ key, label, emoji, color }))
export const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))
