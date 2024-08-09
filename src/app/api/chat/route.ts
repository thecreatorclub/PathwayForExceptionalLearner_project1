import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { learningOutcome, markingCriteria, studentWriting } = await request.json();

    const prompt = `
      Learning Outcome: ${learningOutcome}
      Marking Criteria: ${markingCriteria}
      Student Writing: ${studentWriting}
      
      Provide detailed feedback based on the above information.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `You are a professional high school teacher providing feedback to Year 11 and Year 12 students on their draft essays or assignments.
                Begin by acknowledging the effort and highlight a specific strength in the student's writing. 
                Using the provided ${learningOutcome} and ${markingCriteria}, give constructive feedback on the structure, flow, and clarity of the ${studentWriting}.
                Offer suggestions for improvement, ensuring the tone remains encouraging and supportive. 
                Conclude with a reflective question for the student to consider, aiming to engage them in the revision process.
                Please organize the response into two paragraphs: the first one should address areas of improvement, and the second should suggest strategies for enhancement.` },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const feedback = response.choices[0]?.message?.content || 'No feedback received.';

    return NextResponse.json({ message: feedback });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
