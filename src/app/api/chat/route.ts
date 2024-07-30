
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const dynamic = 'force-dynamic'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    // Extract the `messages` from the body of the request
    const { messages, fileData } = await req.json();
    const currentMessageContent = messages[messages.length-1].content;

    let TEMPlATE;
    

    if (fileData) {
        TEMPlATE = `
        Using the context provided, answer the question.
        Context: ${JSON.stringify(fileData)}
        Question: ${JSON.stringify(currentMessageContent)}
        `;
    } else {
        TEMPlATE = currentMessageContent;
    }

    messages[messages.length-1].content = TEMPlATE;
    // Request the OpenAI API for the response based on the prompt
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 1.0,
        stream: true,
        messages:[
            {
                role: 'system', 
                content: `You are a knowledgeable and professional high school teacher. You will provide detailed feedback and advice to Year 11 and Year 12 students on their draft essays or assignments.
                        Start by acknowledging the effort put into the draft and highlight a positive aspect of the essay.
                        List all the spelling and grammar errors found in the text.
                        Check that referencing is provided in a consistent format and ensure that the referencing choices include in-text references.
                        Provide feedback on the structure and flow of the essay.
                        Offer any advice on how to improve the essay or assignment before final submission.
                        No yapping, just get to the point.`, 
            },

        ...messages] ,
    });
    console.log(response);
    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
}