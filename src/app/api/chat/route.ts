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
        { role: 'system', content: `You are a professional high school teacher. You will provide detailed feedback and advice to Year 11 and Year 12 students on their draft essays or assignments.
                        Start by acknowledging the effort put into the draft and highlight a positive aspect of the essay.
                        Based on the {$learningOutcome} and {$markingCriteria}, provide feedback on the structure and flow of the {$studentWriting}.
                        Offer any advice on how to improve the essay or assignment before final submission. Put the response together in two paragraph 
                        first paragraph should where the student made mistakes and where he could improve and second paragraph should be what the student could do to improve` },
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
