const content = `Step 2: Place queen at (0,0).\\n| Col 0 | Col 1 | Col 2 | Col 3 |\\n|:-----:|:-----:|:-----:|:-----:|\\n|   Q   |   .   |   .   |   .   |\\n|   .   |   .   |   .   |   .   |\\n|   .   |   .   |   .   |   .   |\\n|   .   |   .   |   .   |   .   |\\n\\nStep 3: Try to place in row 1.`;

let processed = content
    .replace(/\\n/g, '\n');

// The regex used in the app
processed = processed.replace(/([^\n\|])\n(\|)/g, '$1\n\n$2');
processed = processed.replace(/(:)\s*(\|)/g, '$1\n\n$2');
processed = processed.replace(/(\|)\s*(\|)/g, '$1\n$2');
processed = processed.replace(/([^\n])\n(\s*\|)/g, '$1\n\n$2');

console.log("--- PROCESSED ---");
console.log(processed);
console.log("-----------------");
