import { getAssignment } from "@/app/api/assignment/[id]/data";
import { Container } from "@radix-ui/themes";
import { AssignmentInfo } from "./AssignmentInfo";
import { AssignmentView } from "./AssignmentView";

export default async function AssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  // State and refs

  const assignment = await getAssignment(params.id);

  if (assignment === null) {
    return <Container className="p-8">Assignment not found</Container>;
  }

  return (
    <>
      <AssignmentInfo assignment={assignment} />
      <AssignmentView assignment={assignment} />
    </>
  );
}
