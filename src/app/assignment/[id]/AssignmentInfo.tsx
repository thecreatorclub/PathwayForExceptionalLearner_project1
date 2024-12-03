import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { renderMentions } from "@/utils/renderMentions";
import type { Assignment } from "@prisma/client";
import { InfoCircledIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Flex, Heading, Text } from "@radix-ui/themes";

export function AssignmentInfo({ assignment }: { assignment: Assignment }) {
  const { learningOutcomes, markingCriteria, additionalPrompt } = assignment;

  return (
    <Accordion type="single" collapsible>
      {/* Learning Outcome Accordion */}
      <AccordionItem value="learning-outcome">
        <AccordionTrigger className="dark:bg-slate-700 bg-gray-200">
          <Flex gap="2" align="center">
            <InfoCircledIcon width={20} height={20} /> Assessment Information
            for &quot;{assignment.title}&quot;
          </Flex>
        </AccordionTrigger>
        <AccordionContent className="p-4 flex flex-col gap-2 border-dashed pt-4 border-t-gray-700 border-t-[1px] dark:bg-slate-800 bg-gray-100">
          <Heading size="4" className="flex gap-2 items-center">
            <Pencil1Icon width={20} height={20} /> Learning Outcomes
          </Heading>
          <Text className="whitespace-pre">{learningOutcomes}</Text>

          <Heading size="4" className="flex gap-2 items-center">
            <Pencil1Icon width={20} height={20} /> Marking Criteria
          </Heading>
          <Text className="whitespace-pre">{markingCriteria}</Text>

          {/* Updated Additional Prompt Display */}
          {additionalPrompt && (
            <>
              <Heading size="4" className="flex gap-2 items-center">
                <Pencil1Icon width={20} height={20} /> Additional Information
              </Heading>
              <Text className="whitespace-pre">
                {renderMentions(additionalPrompt)}
              </Text>
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
