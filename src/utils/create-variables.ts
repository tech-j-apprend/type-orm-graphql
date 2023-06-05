import { Kind, VariableDefinitionNode } from "graphql";
import { QueryVariables } from "../types/query-variables";
import { extractVariables } from "./extract-variables";

export function createVariables<T, K>(
  variables: QueryVariables<K>["variables"],
  conditions: T[]
) {
  const conditionString = JSON.stringify(conditions);
  const variableList = extractVariables(conditionString);

  const variableDefinitions: VariableDefinitionNode[] = [];

  if (variableList.length > 0 && !variables) {
    throw new Error(
      `there are variables defined in your conditions but no variables with types where specified`
    );
  }

  const nodeListCreated = variableList.map<VariableDefinitionNode>(
    (variable) => {
      if (!variables.hasOwnProperty(variable)) {
        throw new Error(
          `Variable ${variable} is not defined in conditions please define it as a value ie. $name`
        );
      }
      const variableType = variables[variable] as string;
      return {
        kind: Kind.VARIABLE_DEFINITION,
        variable: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: variable
          }
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: variableType
          }
        }
      };
    }
  );

  variableDefinitions.push(...nodeListCreated);

  return variableDefinitions;
}
