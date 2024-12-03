import type { Assignment } from "@prisma/client";
import { CaretRightIcon } from "@radix-ui/react-icons";
import {
  Avatar,
  Box,
  Card,
  Container,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import Link from "next/link";

import { getAssignments } from "../api/assignment/route";

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  return (
    <Link
      key={assignment.id}
      className="assignments-link "
      href={`/assignment/${assignment.id}`}
    >
      <Box width="100%">
        <Card size="1" className="dark:hover:bg-slate-900">
          <Flex gap="3" align="center">
            <Avatar
              size="3"
              radius="full"
              fallback={assignment.subject[0] || "S"}
              color="indigo"
            />
            <Box className="flex-1">
              <Text as="div" size="2" weight="bold">
                {assignment.title}
              </Text>
              <Text as="div" size="2" color="gray">
                {assignment.subject} &middot; updated{" "}
                {assignment.updatedAt.toDateString()}
              </Text>
            </Box>
            <CaretRightIcon height={30} width={30} />
          </Flex>
        </Card>
      </Box>
    </Link>
  );
}

function AssignmentGroups({ assignments }: { assignments: Assignment[] }) {
  const grouped = assignments.reduce((acc, assignment) => {
    let group = acc.find((item) => item.key === assignment.subject);
    if (!group) {
      group = { key: assignment.subject, values: [] };
      acc.push(group);
    }
    group.values.push(assignment);
    return acc;
  }, [] as Array<{ key: string; values: Assignment[] }>);

  return (
    <Flex gap="6" direction="column">
      {grouped.map((group) => (
        <Flex gap="3" direction="column" key={group.key}>
          <Heading as="h3" className="text-xl">
            {group.key}
          </Heading>

          {group.values.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </Flex>
      ))}
    </Flex>
  );
}

export default async function AssignmentListPage() {
  // Fetch all assignments
  const assignments = await getAssignments();

  return (
    <Container className="p-8">
      <Heading as="h1" className="mb-4">
        Assignment List
      </Heading>
      <AssignmentGroups assignments={assignments} />
    </Container>
  );
}
