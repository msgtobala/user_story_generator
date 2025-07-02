interface GenerateAcceptanceCriteriaRequest {
  description: string;
  featureName?: string;
  role?: string;
  goal?: string;
  benefit?: string;
  module?: string;
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const SYSTEM_PROMPT = `You are an AI assistant specialized in generating clear, concise, and testable acceptance criteria for user stories in the Intellectual Property (IP) domain using the Salesforce platform. Your outputs must follow best practices in agile software development, align with Salesforce capabilities (such as custom objects, automation, workflows, Apex, and Lightning components), and reflect compliance and accuracy important in the IP industry.

Key Requirements:
- Acceptance criteria should follow the Given/When/Then or Bulleted list format (depending on context).
- Use domain-specific terminology from Intellectual Property (e.g., patents, trademarks, filings, deadlines).
- Consider Salesforce capabilities and constraints.
- Ensure criteria are testable, unambiguous, and tied to the business value of the story.
- Generate 3-6 specific, actionable acceptance criteria.
- Focus on user interactions, system behaviors, and business rules.
- Include validation scenarios and edge cases where appropriate.

Format your response as a simple list of acceptance criteria, one per line, without additional formatting or explanations.`;

export const generateAcceptanceCriteria = async (request: GenerateAcceptanceCriteriaRequest): Promise<string[]> => {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key is not configured. Please add VITE_GOOGLE_API_KEY to your environment variables.');
  }

  const { description, featureName, role, goal, benefit, module } = request;
  
  // Build context from available information
  let context = `Feature: ${featureName || 'Not specified'}\n`;
  context += `Module: ${module || 'Not specified'}\n`;
  context += `Description: ${description}\n`;
  
  if (role || goal || benefit) {
    context += `\nUser Story Context:\n`;
    if (role) context += `- Role: ${role}\n`;
    if (goal) context += `- Goal: ${goal}\n`;
    if (benefit) context += `- Benefit: ${benefit}\n`;
  }
  
  const prompt = `${SYSTEM_PROMPT}\n\nBased on the following context, generate acceptance criteria:\n\n${context}\n\nAcceptance Criteria:`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      // generationConfig: {
      //   temperature: 0.7,
      //   topK: 40,
      //   topP: 0.95,
      //   maxOutputTokens: 1024,
      //   stopSequences: []
      // },
      // safetySettings: [
      //   {
      //     category: "HARM_CATEGORY_HARASSMENT",
      //     threshold: "BLOCK_MEDIUM_AND_ABOVE"
      //   },
      //   {
      //     category: "HARM_CATEGORY_HATE_SPEECH",
      //     threshold: "BLOCK_MEDIUM_AND_ABOVE"
      //   },
      //   {
      //     category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      //     threshold: "BLOCK_MEDIUM_AND_ABOVE"
      //   },
      //   {
      //     category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      //     threshold: "BLOCK_MEDIUM_AND_ABOVE"
      //   }
      // ]
    };

    console.log('Making request to:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage += `. ${errorData.error.message}`;
        }
      } catch (parseError) {
        errorMessage += `. ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No candidates returned from Google AI API');
    }

    const candidate = data.candidates[0];
    
    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      throw new Error('Invalid response structure from Google AI API');
    }

    const generatedText = candidate.content.parts[0].text;
    console.log('Generated text:', generatedText);
    
    if (!generatedText) {
      throw new Error('Empty response from Google AI API');
    }
    
    // Parse the generated text into individual criteria
    const criteria = generatedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.toLowerCase().includes('acceptance criteria:'))
      .filter(line => !line.toLowerCase().startsWith('here are'))
      .map(line => {
        // Remove bullet points, numbers, and dashes
        return line.replace(/^[-•*\d+.\s]+/, '').trim();
      })
      .filter(line => line.length > 10); // Filter out very short lines
    
    console.log('Parsed criteria:', criteria);
    
    return criteria.length > 0 ? criteria : ['Unable to generate specific criteria. Please try again with more detailed description.'];
    
  } catch (error) {
    console.error('Error generating acceptance criteria:', error);
    
    if (error instanceof Error) {
      throw new Error(`Error generating acceptance criteria: ${error.message}`);
    } else {
      throw new Error('Error generating acceptance criteria: Unknown error occurred');
    }
  }
};