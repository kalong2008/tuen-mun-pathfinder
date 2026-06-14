const LEADING_REQUIREMENT_NUMBER = /^\d+\.\s*/;

export function formatRequirementForDisplay(requirement: string): string {
  return requirement.replace(LEADING_REQUIREMENT_NUMBER, "");
}
