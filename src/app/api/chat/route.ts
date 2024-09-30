import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client using the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the POST request handler for the API route
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body to extract relevant fields
    const { learningOutcome, markingCriteria, studentWriting } = await request.json();

    // Create a detailed prompt that includes specific instructions for the AI
    // to generate feedback based on the learning outcome, marking criteria, and student writing.
    const prompt = `
      Learning Outcome: ${learningOutcome}
      Marking Criteria: ${markingCriteria}
      Student Writing: ${studentWriting}
      
      Provide detailed feedback based on the above information.
    `;

    // Send a request to OpenAI's GPT-4 model using the defined prompt.
    // This request includes a complex set of instructions (system message) for the AI to follow,
    // ensuring that the feedback is detailed, actionable, and well-structured.
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',  // Use the GPT-4 model optimized for chat completions.
      messages: [
        {
          role: 'system',
          content: `
            Before providing any feedback, first check if the student's writing is less than or equal to 250 words. 
            If it is, let the student know that the text is too short. 
            If the submission is blank, return a score of zero.

            When offering feedback, use first-person language to create a friendly and supportive tone. 
            Begin with a concise yet insightful summary of the student's work in 3 sentences maximum, acknowledging strengths and weaknesses.

            For each issue, provide the exact text that contains the error and use the format '**Original Text:** "..." <endoforiginal>'. 
            For improvements, start with '**Improvement:**', explain the issue, provide a reason why it is incorrect, 
            and what they could do to improve without giving an example. End each improvement with '<endofimprovement>'.

            Emphasize key terms to draw attention to crucial concepts and areas for improvement. Provide specific examples where possible.

            Feedback on Areas of Improvement: Based on the provided learning outcome and marking criteria, 
            provide a detailed analysis of the student's writing, highlighting issues such as unclear thesis statements, 
            disjointed paragraphs, or insufficient evidence. Ensure that your feedback is precise, using examples from the student's work.

            Suggestions for Enhancement: Offer concrete strategies for improvement, such as reorganizing sections for better flow, 
            refining the thesis statement, or elaborating on arguments. Suggest advanced English techniques such as metaphor or symbolism.

            Conclude your feedback by encouraging the student to take ownership of their improvement, 
            and emphasize the potential impact of the changes on the overall quality of their work.

            For each suggestion, start with a capitalized keyword or phrase to emphasize the key point. 
            Conclude with a bullet-point list that assigns an overall score or rating for each criterion, 
            making it clear how the work measures up against the expectations.
          `,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,  // Set temperature to 0.4 to keep the responses focused and less random.
      max_tokens: 1000,   // Set maximum tokens to ensure the response does not exceed limits.
    });

    // Extract the generated feedback from the response
    const feedback = response.choices[0]?.message?.content || 'No feedback received.';

    // Return the feedback as a JSON response
    return NextResponse.json({ message: feedback });
  } catch (error) {
    console.error('Error:', error);  // Log any errors to the console
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
