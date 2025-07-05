// Demo JavaScript file for Mobile Code Editor
// This file demonstrates JavaScript syntax highlighting and execution

// Variables and basic operations
const greeting = "Hello, Mobile Code Editor!";
let count = 0;
const numbers = [1, 2, 3, 4, 5];

// Function declaration
function calculateSum(arr) {
    return arr.reduce((sum, num) => sum + num, 0);
}

// Arrow function
const multiply = (a, b) => a * b;

// Object with methods
const calculator = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => b !== 0 ? a / b : "Cannot divide by zero"
};

// Demo execution
console.log(greeting);
console.log("Sum of numbers:", calculateSum(numbers));
console.log("Multiply 5 * 3:", multiply(5, 3));
console.log("Calculator demo:");
console.log("10 + 5 =", calculator.add(10, 5));
console.log("10 - 5 =", calculator.subtract(10, 5));
console.log("10 * 5 =", calculator.multiply(10, 5));
console.log("10 / 5 =", calculator.divide(10, 5));

// DOM manipulation (if running in browser)
if (typeof document !== 'undefined') {
    console.log("Document is available for DOM manipulation");
} else {
    console.log("Running in editor environment");
}

// Async example with Promise
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function asyncDemo() {
    console.log("Starting async demo...");
    await delay(100);
    console.log("Async demo completed!");
}

// Run the async demo
asyncDemo();

// Array methods demonstration
const fruits = ['apple', 'banana', 'orange', 'grape'];
console.log("Original fruits:", fruits);
console.log("Fruits in uppercase:", fruits.map(fruit => fruit.toUpperCase()));
console.log("Fruits with 'a':", fruits.filter(fruit => fruit.includes('a')));

// Object destructuring
const person = { name: 'John', age: 30, city: 'New York' };
const { name, age } = person;
console.log(`Person: ${name}, Age: ${age}`);

// Template literals and modern features
const features = ['Syntax Highlighting', 'Mobile Optimized', 'File Management'];
console.log(`Mobile Code Editor Features:\n${features.map(f => `• ${f}`).join('\n')}`);

console.log("Demo completed! You can edit this file and click 'Run' to see the results.");