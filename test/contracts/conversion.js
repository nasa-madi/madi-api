const fs = require('fs');
const path = require('path');

// Helper function to modify the src paths
function modifySrcPath(data) {
  // Use regex to capture the last two segments of the path
  const regex = /.*\/([^/]+\/[^/]+)$/;
  return data.replace(regex, '$1');
}

// Recursive function to traverse and modify the nested structure
function traverseAndModify(node) {
  // Check if node is an array
  if (Array.isArray(node)) {
    node.forEach((item) => traverseAndModify(item));
  } 
  // Check if node is an object
  else if (typeof node === 'object' && node !== null) {
    // Check if the current node is a formdata object with the desired structure
    if (node.key && node.type === 'file' && node.src) {
      node.src = modifySrcPath(node.src);
    }
    // Recursively process each property of the object
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        traverseAndModify(node[key]);
      }
    }
  }
}

// Get input and output file paths from command line arguments
const [,, inputFilePath, outputFilePath] = process.argv;

if (!inputFilePath || !outputFilePath) {
  console.error('Usage: node conversion.js <inputFilePath> <outputFilePath>');
  process.exit(1);
}

// Read the JSON file
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Parse JSON data
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
    return;
  }

  // Traverse and modify the JSON structure
  traverseAndModify(jsonData);

  // Write the modified data back to a new file
  fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing file:', writeErr);
    } else {
      console.log(`File has been modified and saved as ${outputFilePath}`);
    }
  });
});