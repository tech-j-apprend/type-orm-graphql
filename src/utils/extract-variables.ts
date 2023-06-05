export function extractVariables(whereCondition: string): string[] {
  const variableRegex = /\$(\w+)/g;
  const variables: string[] = [];
  let match;

  while ((match = variableRegex.exec(whereCondition)) !== null) {
    variables.push(match[1]);
  }

  return variables;
}
