import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    
  try {
    const { Criteria, line } = await request.json();
    console.log(Criteria, line);
    const prompt = `
    Question and Students response ( For each /n give feedback, ignore studentID): ${line}

    Marking Criteria:
    ---
    ${Criteria}
    ---
    `;

    const messages = [
      {
        role: "system",
        content: `
You are a tutor at university marking papers, you must provide concise and insightful feedback with a mark out of 0-5. You must provide the reason on why you gave that mark, this is all to help the teacher give the student the best feedback possible.

Instructions:
- Read the student's response to the question.
- Provide feedback based on the marking criteria provided.
- Give a mark out of 5 based on the student's response.(eg full marks if correct, 0 if completely wrong)
- After each feedback you provide make a new line (/n)
        `,
      },
      { role: "user", content: prompt },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", //use 4o for demonstration only
        //model: 'gemini-1.5-flash',
        messages: messages,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(errorData.error.message);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    return NextResponse.json({ message: feedback });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
