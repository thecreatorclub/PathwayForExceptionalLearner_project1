import { NextResponse, NextRequest } from "next/server";
import { Biology, History } from "@/components/select-menu/data";

export async function POST(request: NextRequest) {
  try {
    const { learningOutcome, markingCriteria, studentWriting, additionalPrompt } = await request.json();
    const processTemplateText = (text: string) => {
      const templateMap: { [key: string]: string } = {
        'biology-prompt': Biology,
        'history-prompt': History,
        // Add more templates as needed
      };

      // Replace mentions with actual template content
      return text.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, (match, display, id) => {
        return templateMap[id] || match;
      });
    };

    // Process the additionalPrompt
    const processedAdditionalPrompt = processTemplateText(additionalPrompt);
    // console.log("Processed Additional Prompt:", processedAdditionalPrompt);

    const prompt = `
    Learning Outcome: ${learningOutcome}
    Marking Criteria: ${markingCriteria}
    Additional Instructions: ${processedAdditionalPrompt}
    Student Writing:
    ---
    ${studentWriting}
    ---
    `;

    const messages = [
      {
        role: "system",
        content: `
You are a helpful assistant providing detailed feedback on student writing.

Instructions:
- Check if the student's writing is ≤ 250 words. If so, inform them it's too short. If blank, assign a score of zero.
- Use a friendly, supportive tone with first-person language.
- Begin with a concise summary (max 3 sentences) of the student's work, acknowledging strengths and weaknesses.

**Areas of Improvement**:(don't write the heading for Areas of Improvement)
- Identify all errors by quoting the exact text containing each error using the format:
  - **Original Text:** "student writing where error occur"<endoforiginal>
  - **Improvement:** Explain why it's incorrect and suggest improvements without direct examples.<endofimprovement>
- Provide all errors found using this format for each one.

**Suggestions for Enhancement**:
- Offer concrete strategies for overall improvement (e.g., reorganizing content, refining arguments).
- Suggest advanced English techniques like metaphor or symbolism when suitable.
- Keep this section separate from "Areas of Improvement" to distinguish between specific errors and broader enhancement ideas.

**Detailed Analysis**:
- Provide analysis based on the learning outcome and marking criteria.
- Highlight specific issues using examples from the student's work where appropriate.

**Conclusion**:
- Encourage the student to take ownership of their improvement.
- Emphasize the positive impact of the suggested changes.

**Scoring**:
- Finish with a bullet-point list assigning an overall score or rating for each criterion.
- Clearly indicate how the work measures up against expectations.
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
        model: "gpt-4o",
        // model: 'gemini-1.5-flash',
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
