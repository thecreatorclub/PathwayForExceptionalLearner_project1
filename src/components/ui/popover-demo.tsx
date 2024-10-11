// components/PopoverDemo.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LightningBoltIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface PopoverDemoProps {
  initialPrompt: string;
  onSave: (prompt: string) => void;
  onClear: () => void;
}

const PopoverDemo: React.FC<PopoverDemoProps> = React.memo(
  ({ initialPrompt, onSave, onClear }) => {
    const [localPrompt, setLocalPrompt] = useState(initialPrompt);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [activeButton, setActiveButton] = useState<string | null>(null);

    // Sync localPrompt with initialPrompt when Popover opens
    useEffect(() => {
      if (popoverOpen) {
        setLocalPrompt(initialPrompt);
      }
    }, [popoverOpen, initialPrompt]);

    // Predefined content for buttons
    const buttonPrompts = {
      Biology: `
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
`,
      History: 
      `Update Prompt with below:
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
  `,};

    // Handle button click to update textarea and active state
    const handleButtonClick = (buttonName: keyof typeof buttonPrompts) => {
      // Check if the prompt text is already present in the textarea
      if (!localPrompt.includes(buttonPrompts[buttonName])) {
        // If not, add the text to the textarea
        setLocalPrompt((prev) => prev + (prev ? "\n" : "") + buttonPrompts[buttonName]);
        setActiveButton(buttonName); // Set the active button to apply specific styling
      } else {
        console.log(`The ${buttonName} prompt is already present in the textarea.`);
      }
    };

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="icon-button" aria-label="Open Prompt Popover">
            <LightningBoltIcon />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "z-50 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside Popover from closing it
        >
          <div className="grid columns-1">
            <h3 className="text-xl font-bold leading-tight">Additional Prompt</h3>
          </div>
          <div className="grid gap-4">
            <div className="flex space-x-4">
              {/* New Buttons Column on the Left Side */}
              <div className="flex flex-col justify-start space-y-2">
                <button
                  className={`popover-button button-tertiary ${
                    activeButton === "Biology" ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => handleButtonClick("Biology")}
                >
                  Biology
                </button>
                <button
                  className={`popover-button button-tertiary ${
                    activeButton === "History" ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => handleButtonClick("History")}
                >
                  History
                </button>
              </div>
              {/* Textarea */}
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevents click events from bubbling up
                onFocus={(e) => e.stopPropagation()} // Prevents focus events from bubbling up
                rows={10}
                className="textarea"
                style={{ width: "100%", height: "200px", overflowY: "auto" }}
                placeholder="Enter additional prompt here..."
              />
            </div>
            {/* Horizontal Save and Clear Buttons */}
            <div className="grid gap-2">
              <div className="flex justify-end space-x-2">
                <button
                  className="popover-button button-primary"
                  onClick={() => {
                    onSave(localPrompt);
                    setPopoverOpen(false); // Close Popover after saving
                    setActiveButton(null); // Reset active button state
                  }}
                >
                  Save
                </button>
                <button
                  className="popover-button button-secondary"
                  onClick={() => {
                    onClear();
                    setLocalPrompt(""); // Clear the local prompt
                    setPopoverOpen(false); // Close Popover after clearing
                    setActiveButton(null); // Reset active button state
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

PopoverDemo.displayName = "PopoverDemo";

export default PopoverDemo;