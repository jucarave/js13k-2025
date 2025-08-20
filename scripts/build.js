const fs = require('fs');
const path = require('path');

function minifyGame() {
  // Read the source game file
  const srcPath = path.join(__dirname, '../src/game.js');
  const srcCode = fs.readFileSync(srcPath, 'utf8');
  
  console.log('Original file size:', srcCode.length, 'bytes');
  
  // Find all cr_ prefixed identifiers
  const crIdentifiers = new Set();
  const crPattern = /\bcr_[a-zA-Z_][a-zA-Z0-9_]*/g;
  let match;
  
  while ((match = crPattern.exec(srcCode)) !== null) {
    crIdentifiers.add(match[0]);
  }
  
  console.log('Found cr_ identifiers:', Array.from(crIdentifiers));
  
  // Generate short variable names (a, b, c, ..., z, aa, ab, ac, ...)
  function generateShortNames(count) {
    const names = [];
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    
    // JavaScript reserved words to avoid
    const reservedWords = new Set([
      'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 
      'eval', 'null', 'this', 'true', 'void', 'with', 'await', 'break', 'catch', 
      'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 'delete', 
      'export', 'import', 'public', 'return', 'static', 'switch', 'typeof', 
      'default', 'extends', 'finally', 'package', 'private', 'continue', 
      'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 
      'instanceof'
    ]);
    
    // Single letter names
    for (let i = 0; i < chars.length && names.length < count; i++) {
      const name = chars[i];
      if (!reservedWords.has(name)) {
        names.push(name);
      }
    }
    
    // Two letter names
    for (let i = 0; i < chars.length && names.length < count; i++) {
      for (let j = 0; j < chars.length && names.length < count; j++) {
        const name = chars[i] + chars[j];
        if (!reservedWords.has(name)) {
          names.push(name);
        }
      }
    }
    
    // Three letter names if needed
    for (let i = 0; i < chars.length && names.length < count; i++) {
      for (let j = 0; j < chars.length && names.length < count; j++) {
        for (let k = 0; k < chars.length && names.length < count; k++) {
          const name = chars[i] + chars[j] + chars[k];
          if (!reservedWords.has(name)) {
            names.push(name);
          }
        }
      }
    }
    
    return names;
  }
  
  // Create mapping of cr_ identifiers to short names
  const identifierMap = new Map();
  const shortNames = generateShortNames(crIdentifiers.size);
  let nameIndex = 0;
  
  for (const identifier of crIdentifiers) {
    identifierMap.set(identifier, shortNames[nameIndex++]);
  }
  
  console.log('Identifier mapping:', Object.fromEntries(identifierMap));
  
  // Replace cr_ identifiers with short names
  let minifiedCode = srcCode;
  for (const [original, replacement] of identifierMap) {
    // Use word boundary regex to ensure we only replace complete identifiers
    const regex = new RegExp('\\b' + original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    minifiedCode = minifiedCode.replace(regex, replacement);
  }
  
  // Preserve template literals and string literals by temporarily replacing them with placeholders
  const templateLiterals = [];
  const stringLiterals = [];
  
  // Preserve template literals (backticks)
  minifiedCode = minifiedCode.replace(/`([^`]*)`/g, (match, content) => {
    const index = templateLiterals.length;
    templateLiterals.push(match);
    return `__TEMPLATE_LITERAL_${index}__`;
  });
  
  // Preserve string literals (single and double quotes) to maintain internal spacing
  minifiedCode = minifiedCode.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
    const index = stringLiterals.length;
    stringLiterals.push(match);
    return `__STRING_LITERAL_${index}__`;
  });
  
  // Remove comments (both single line and multi-line)
  minifiedCode = minifiedCode.replace(/\/\*[\s\S]*?\*\//g, '');
  minifiedCode = minifiedCode.replace(/\/\/.*$/gm, '');
  
  // Remove unnecessary whitespace and newlines (now safe since strings are preserved)
  minifiedCode = minifiedCode
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\s*([{}();,=+\-*\/&|!<>?:])\s*/g, '$1') // Remove spaces around operators and punctuation
    .replace(/,\s+/g, ',') // Remove spaces after commas in parameters and arrays
    .replace(/\s+,/g, ',') // Remove spaces before commas
    .replace(/^\s+|\s+$/g, '') // Trim leading and trailing whitespace
    .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
    .replace(/\s*\n\s*/g, ''); // Remove all newlines and surrounding spaces
  
  // Restore string literals with their original spacing
  stringLiterals.forEach((literal, index) => {
    minifiedCode = minifiedCode.replace(`__STRING_LITERAL_${index}__`, literal);
  });
  
  // Restore template literals (shaders) with their original formatting
  templateLiterals.forEach((literal, index) => {
    minifiedCode = minifiedCode.replace(`__TEMPLATE_LITERAL_${index}__`, literal);
  });
  
  console.log('Minified file size:', minifiedCode.length, 'bytes');
  console.log('Size reduction:', ((srcCode.length - minifiedCode.length) / srcCode.length * 100).toFixed(2) + '%');
  
  // Write minified code to dist folder
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }
  
  const distPath = path.join(distDir, 'g.js');
  fs.writeFileSync(distPath, minifiedCode);
  
  console.log('Minified file written to:', distPath);
  
  // Also log the minified code for inspection
  console.log('\nMinified code:');
  console.log(minifiedCode);
  
  return minifiedCode;
}

// Run the minifier
if (require.main === module) {
  minifyGame();
}

module.exports = { minifyGame };