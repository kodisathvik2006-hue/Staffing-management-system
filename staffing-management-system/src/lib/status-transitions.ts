import { ProjectStatus } from "@prisma/client";

const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["PAUSED", "TERMINATED", "COMPLETED"],
  PAUSED: ["ACTIVE", "TERMINATED"],
  TERMINATED: ["ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransition(
  from: ProjectStatus,
  to: ProjectStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedTransitions(
  status: ProjectStatus
): ProjectStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}
