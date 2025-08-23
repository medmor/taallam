import { learningCategories } from './data.js';

// Flatten all items from learningCategories
const items = (learningCategories || []).flatMap(cat => cat.items || []);

// Log Arabic names with "هذا <name>"
items.forEach(item => {
  if (!item || !item.name) return;
  console.log(item.name);
  console.log(`هذا ${item.name}`);
});

// Log English names with "this is a <enName>"
items.forEach(item => {
  if (!item || !item.enName) return;
  console.log(item.enName);
  console.log(`this is a ${item.enName}`);
});

// Log French names with "this is a <frName>"
items.forEach(item => {
  if (!item || !item.frName) return;
  console.log(item.frName);
  console.log(`c'est un ${item.frName}`);
});

export default null;
