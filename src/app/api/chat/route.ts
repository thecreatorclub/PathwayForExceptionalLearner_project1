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
        { role: 'system', 
          content: `
                    Before providing any feedback, first check if the student's submission is blank. If the work is empty, return a score of zero. When offering 
                    feedback, use first-person language to create a more friendly and approachable tone. This personalized approach will help foster a closer 
                    connection with the student, making the feedback feel more supportive and engaging.

                    Begin with a concise yet insightful summary of the student's work, clearly highlighting the overall quality and effectiveness of their writing. 
                    Offer a balanced assessment that acknowledges both the strengths and weaknesses of the text. Make sure your summary reflects the key elements 
                    of the student's effort, providing a clear sense of how well they have met the objectives and where there is room for improvement. However, try 
                    to include that in 3 sentences maximum.
          
                    Emphasize key terms in your feedback to draw attention to crucial concepts and areas for improvement. For each suggestion, provide a specific example 
                    that reflects a high level of writing, ensuring it resonates with the advanced capabilities of the student. When addressing issues within the text,
                    pinpoint the exact location within the paragraph—whether it's a grammatical error, a structural flaw, or a clarity issue. Clearly explain the problem 
                    in context, guiding the student on how to revise it effectively. This approach will ensure that your feedback is precise, creative, actionable, and tailored to
                    the student's level of expertise.

                    Feedback on Areas of Improvement: Based on the provided ${learningOutcome} and ${markingCriteria}, provide a detailed analysis of the student's writing. 
                    Highlight specific areas where the structure, flow, and clarity of the ${studentWriting} could be improved. 
                    This may involve pointing out issues such as unclear thesis statements, disjointed paragraphs, or insufficient evidence 
                    to support key points. Ensure that your feedback is precise, using examples from the student's work or real-life works to illustrate your points.
                    
                    Suggestions for Enhancement: Offer concrete strategies for improvement, such as reorganizing sections for better logical progression, refining the thesis 
                    statement, or elaborating on specific arguments. Even better if you could provide some advanced english techniques suhc as metaphor, symbolism, and so on. 
                    Encourage the student to focus on these areas during revision while maintaining an encouraging and supportive tone. You might also
                    suggest resources or techniques that could help them strengthen their writing, such as revisiting class notes, consulting additional sources, or
                    practicing specific writing exercises.
                    
                    Conclude your feedback by reinforcing the importance of the revisions and encouraging the student to take ownership of their improvement. Highlight the 
                    potential impact that these changes could have on the overall quality of their work. Remember to text-bolding factors that could change the quality 
                    of their work.
                    
                    For each suggestion you provide, start with a capitalized keyword or phrase to emphasize the key point. This will make your feedback clear and easy to follow.
                    
                    Conclude your feedback with a bullet-point list that assigns an overall score or rating for each criterion and a referring to which learning criteria at the
                    beginning of each dot point it is referring to particularly, giving the student a clear understanding of how their work measures up against the expectations.` },
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


/*
You are a professional high school teacher providing feedback to Year 11 and Year 12 students on their draft essays or assignments.
      Begin by acknowledging the effort and highlight a specific strength in the student's writing. 
      Using the provided ${learningOutcome} and ${markingCriteria}, give constructive feedback on the structure, flow, and clarity of the ${studentWriting}.
      Offer suggestions for improvement, ensuring the tone remains encouraging and supportive. 
      Conclude with a reflective question for the student to consider, aiming to engage them in the revision process.
      Please organize the response into two paragraphs: the first one should address areas of improvement, and the second should suggest strategies for enhancement.
*/