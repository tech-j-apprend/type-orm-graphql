import {
  ASTNode,
  ArgumentNode,
  FieldNode,
  Kind,
  OperationTypeNode,
  SelectionNode,
  print
} from "graphql";
import { processArgument } from "../utils/process-argument";
import { BaseQuery } from "../types/base-query";
import { QueryVariables } from "../types/query-variables";
import { createVariables } from "../utils/create-variables";
import { toStartCase } from "../utils/start-case";

export type DeleteParams<T, K extends string | number | symbol, M> = BaseQuery &
  QueryVariables<M> & {
    where: T;
    returning?: Partial<Record<K, boolean>>;
    withAffectedRows?: boolean;
  };

export const deleteSelf = <T, K extends string | number | symbol, M>({
  where,
  returning = {},
  withAffectedRows = false,
  entityName = "",
  queryName = `delete${toStartCase(entityName).replace(/\s/g, "")}`,
  variables
}: DeleteParams<T, K, M>) => {
  const entityOperation = `delete_${entityName}`;

  const whereNodes: ArgumentNode | undefined = where
    ? processArgument({ condition: where })
    : undefined;

  const selectionNodes: SelectionNode[] = Object.keys(returning).map(
    (selection) => ({
      kind: Kind.FIELD,
      name: {
        kind: Kind.NAME,
        value: selection
      }
    })
  );

  const variableDefinitionNodes = createVariables<unknown, M>(variables, [
    where
  ]);

  const returningObject: FieldNode = {
    kind: Kind.FIELD,
    name: {
      kind: Kind.NAME,
      value: "returning"
    },
    selectionSet: {
      kind: Kind.SELECTION_SET,
      selections: selectionNodes
    }
  };

  const affectedRowsObject: FieldNode | undefined = withAffectedRows
    ? {
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: "affected_rows"
        }
      }
    : undefined;

  const ast: ASTNode = {
    kind: Kind.DOCUMENT, // FIRST NODE
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION, // TYPE OF OPERATION
        operation: OperationTypeNode.MUTATION,
        variableDefinitions: variableDefinitionNodes,
        selectionSet: {
          kind: Kind.SELECTION_SET, // SELECT FIELDS
          selections: [
            {
              kind: Kind.FIELD,
              name: {
                kind: Kind.NAME,
                value: entityOperation
              },
              arguments: [whereNodes],
              selectionSet: {
                kind: Kind.SELECTION_SET,
                selections: [returningObject, affectedRowsObject]
              }
            }
          ]
        },
        name: {
          kind: Kind.NAME,
          value: queryName
        }
      }
    ]
  };

  return print(ast);
};
