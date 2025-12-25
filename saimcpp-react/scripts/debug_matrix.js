const content = `Input Matrix:\\n| Col 0 | Col 1 | Col 2 | Col 3 |\\n|:-----:|:-----:|:-----:|:-----:|\\n|   Q   |   .   |   .   |   .   |\\n|   .   |   .   |   .   |   .   |\\n|   .   |   .   |   .   |   .   |\\n|   .   |   .   |   .   |   .   |`;

console.log("Original Content (with literals):", content);

// Simulate the App's processing
let processed = content
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n');

console.log("\nAfter newline replacement:");
console.log(processed);

// Apply refined Fixes
// 1. Label: Ensure table starts on a new line after text, with a blank line.
processed = processed.replace(/(:)\s*(\|[^\n]+)/g, '$1\n\n$2');

// 2. Concatenated rows: Fix squashed rows
processed = processed.replace(/\|\s*\|/g, '|\n|');

// 3. Header separator: Ensure it's on a new line, but NOT with an empty line
processed = processed.replace(/(\|\s*)\n\n(\|\s*:?-+)/g, '$1\n$2');

// 4. Remove extra gaps: Reducing multiple newlines between rows to single newline
processed = processed.replace(/(\|\s*)\n\n+(\|)/g, '$1\n$2');

// 5. Ensure blank line before table (if text precedes it)
// Only if it's NOT already a newline
processed = processed.replace(/([^\n])\n(\s*\|)/g, '$1\n\n$2');

console.log("\nFinal Processed Output:");
console.log(processed);
