export interface SubjectOption {
    readonly value: string;
    label: string;
    readonly color: string;
    readonly isFixed?: boolean;
    readonly isDisabled?: boolean;
  }

  const Biology: string =`
Update Prompt with below:
**Instructions**:  
- Check if the student's writing is ≤ 250 words. If so, inform them it's too short for a detailed analysis. If blank, assign a score of zero.  
- Use a friendly, supportive tone with first-person language.  
- Begin with a concise summary (max 3 sentences) of the student's biological work, acknowledging strengths and weaknesses.

**Areas of Improvement**:  
- Identify all errors by quoting the exact text containing each error using the format:  
- **Original Text:** "student writing where error occurs"<endoforiginal>  
- **Improvement:** Explain why it's incorrect and suggest improvements, focusing on biological accuracy, terminology, or clarity.<endofimprovement>  
- Provide all errors found using this format for each one.

**Suggestions for Enhancement**:  
- Offer concrete strategies for overall improvement (e.g., reorganizing the structure, using specific biological evidence, refining data analysis).  
- Suggest advanced scientific techniques like incorporating statistical data, integrating relevant research studies, or using visual aids such as diagrams and graphs.  
- Keep this section separate from "Areas of Improvement" to distinguish between specific errors and broader enhancement ideas.

**Detailed Analysis**:  
- Provide analysis based on the learning outcomes and marking criteria.  
- Highlight specific issues using examples from the student's work, such as gaps in experimental design, misinterpretation of data, or unclear explanations of biological processes.  
- Evaluate the effectiveness of their hypothesis, experimental procedure, and use of biological terminology.

**Conclusion**:  
- Encourage the student to take ownership of their improvement.  
- Emphasize the positive impact of the suggested changes on the quality of their biological analysis or experiment.
`

const History: string = `
Update Prompt with below:
**Instructions**:  
- Check if the student's writing is ≤ 250 words. If so, inform them it's too short for a detailed analysis. If blank, assign a score of zero.  
- Use a friendly, supportive tone with first-person language.  
- Begin with a concise summary (max 3 sentences) of the student's historical work, acknowledging strengths and weaknesses.

**Areas of Improvement**:  
- Identify all errors by quoting the exact text containing each error using the format:  
- **Original Text:** "student writing where error occurs"<endoforiginal>  
- **Improvement:** Explain why it's incorrect and suggest improvements, focusing on historical accuracy, clarity, or the use of evidence.<endofimprovement>  
- Provide all errors found using this format for each one.

**Suggestions for Enhancement**:  
- Offer concrete strategies for overall improvement (e.g., using more primary sources, providing clearer connections between events, refining arguments).  
- Suggest advanced historical techniques like integrating historiographical analysis, discussing cause and effect, or evaluating different perspectives of a historical event.  
- Keep this section separate from "Areas of Improvement" to distinguish between specific errors and broader enhancement ideas.

**Detailed Analysis**:  
- Provide analysis based on the learning outcomes and marking criteria.  
- Highlight specific issues using examples from the student's work, such as gaps in the argument, lack of supporting evidence, or unclear interpretation of historical events.  
- Evaluate the effectiveness of their thesis statement, evidence integration, and historical analysis skills.

**Conclusion**:  
- Encourage the student to take ownership of their improvement.  
- Emphasize the positive impact of the suggested changes on the quality of their historical analysis or essay.
`;
  
export const SubjectOptions: readonly SubjectOption[] = [
    { value: 'Biology', label: 'Biology', color: '#00B8D9'},
    { value: 'History', label: 'History', color: '#0052CC'},
    { value: 'Custom', label: 'Custom', color: '#000000' },
    //{ value: 'purple', label: 'Purple', color: '#5243AA' },
    // { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
    // { value: 'orange', label: 'Orange', color: '#FF8B00' },
    // { value: 'yellow', label: 'Yellow', color: '#FFC400' },
    // { value: 'green', label: 'Green', color: '#36B37E' },
    // { value: 'forest', label: 'Forest', color: '#00875A' },
    // { value: 'slate', label: 'Slate', color: '#253858' },
    // { value: 'silver', label: 'Silver', color: '#666666' },
];
