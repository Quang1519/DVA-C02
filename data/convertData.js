const fs = require('fs');
const path = require('path');

function convertToJson() {
  try {
    // Read the data.md file
    const mdContent = fs.readFileSync(path.join(__dirname, 'data.md'), 'utf8');
    
    // Split content into sections based on questions
    const questions = processData(mdContent);
    
    
    // Write to questions.json file
    fs.writeFileSync(
      path.join(__dirname, 'questions.json'),
      JSON.stringify(questions, null, 2),
      'utf8'
    );
    
    console.log(`Successfully converted ${questions.length} questions to JSON`);
  } catch (error) {
    console.error('Error converting data:', error);
  }
}

function processData(data) {
    // Split the data into individual questions
    const questionBlocks = data.split(/(?=###)/);
    
    // Initialize the questions array
    const questions = [];
    
    // Process each question block
    questionBlocks.forEach((block, index) => {
      if (!block.trim()) return; // Skip empty blocks
      
      // Split the block into lines
      const lines = block.trim().split('\n');
      
      // Extract the question text (remove the ### prefix)
      const questionText = lines[0].replace(/^### /, '');
      
      // Initialize options array and correctAnswers array
      const options = [];
      const correctAnswers = [];
      
      // Track if we're in an image block
      let questionImage = "";
      let currentOptionId = 0;
      
      // Process each line to extract options and images
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this is an option line
        if (line.startsWith('- [')) {
          currentOptionId++;
          const isCorrect = line.includes('[x]');
          const optionText = line.replace(/- \[[ x]\] /, '');
          
          // Create the option object
          options.push({
            id: currentOptionId,
            text: optionText,
            image: "" // Will be updated if there's an image on the next line
          });
          
          // If this option is correct, add its ID to correctAnswers
          if (isCorrect) {
            correctAnswers.push(currentOptionId);
          }
        }
        // Check if this is an image line for the question
        else if (line.startsWith('![Question') && !line.includes('option')) {
          const imageMatch = line.match(/\((.*?)\)/);
          if (imageMatch) {
            questionImage = imageMatch[1];
          }
        }
        // Check if this is an image line for an option
        else if (line.startsWith('![') && currentOptionId > 0) {
          const imageMatch = line.match(/\((.*?)\)/);
          if (imageMatch) {
            options[currentOptionId - 1].image = imageMatch[1];
          }
        }
      }
      
      // Create the question object
      questions.push({
        id: index,
        question: questionText,
        options: options,
        image: questionImage,
        correctAnswer: {
          id: correctAnswers
        }
      });
    });
    
    // Return the final JSON structure
    return { questions };
  }

// Execute the conversion
convertToJson();
  