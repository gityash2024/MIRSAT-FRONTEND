import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'InspectionStepForm.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Import CustomTimeInput
content = content.replace(
  `import { updateUserTaskProgress, uploadTaskAttachment } from '../../../store/slices/userTasksSlice';`,
  `import { updateUserTaskProgress, uploadTaskAttachment } from '../../../store/slices/userTasksSlice';
import { CustomTimeInput } from './TimeInput';`
);

// Remove duplicate styled component declarations
const seenComponents = new Set();
const lines = content.split('\n');
const result = [];

let isInStyledComponent = false;
let currentComponentName = '';
let currentBlock = [];

// Replace TimeInput with CustomTimeInput in JSX
content = content.replace(/<TimeInput /g, '<CustomTimeInput ');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this is the start of a styled component declaration
  const match = line.match(/^const\s+(\w+)\s+=\s+styled\./);
  
  if (match) {
    // Starting a new styled component
    currentComponentName = match[1];
    isInStyledComponent = true;
    currentBlock = [line];
    
    // If we've seen this component before, skip it
    if (seenComponents.has(currentComponentName)) {
      isInStyledComponent = false;
      continue;
    }
    
    seenComponents.add(currentComponentName);
  } else if (isInStyledComponent) {
    // Inside a styled component
    currentBlock.push(line);
    
    // Check if this is the end of the styled component
    if (line.trim() === '`;') {
      isInStyledComponent = false;
      result.push(...currentBlock);
      currentBlock = [];
    }
  } else {
    // Not in a styled component, add the line
    result.push(line);
  }
}

fs.writeFileSync(filePath, result.join('\n'), 'utf8');
console.log('File updated successfully!'); 