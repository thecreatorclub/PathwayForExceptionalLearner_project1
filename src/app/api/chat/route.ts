import { NextResponse, NextRequest } from "next/server"; // Import 'NextResponse' and 'NextRequest' from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body to extract relevant fields
    const { learningOutcome, markingCriteria, studentWriting } = await request.json();

    // Create a detailed prompt that includes specific instructions for the AI
    const prompt = `
      Learning Outcome: ${learningOutcome}
      Marking Criteria: ${markingCriteria}
      Student Writing: ${studentWriting}

      Provide detailed feedback based on the above information.
    `;

    // Prepare the messages array with the system prompt and user prompt
    const messages = [
      {
        role: "system",
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
      { role: "user", content: prompt },
    ];

    // Make a POST request to OpenAI's Chat Completion API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Ensure your API key is set in the environment variable
      },
      body: JSON.stringify({
        model: "gpt-4", // Specify the model you want to use
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(errorData.error.message);
    }

    const data = await response.json();

    // Extract the assistant's reply from the response
    const feedback = data.choices[0].message.content;

    // Return the feedback as a JSON response
    console.log(feedback);
    return NextResponse.json({ message: feedback });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
