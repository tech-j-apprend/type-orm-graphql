import {
  ASTNode,
  ArgumentNode,
  Kind,
  OperationTypeNode,
  SelectionNode,
  print
} from "graphql";
import { processArgument } from "../utils/process-argument";
import { BaseQuery } from "../types/base-query";
import { QueryVariables } from "../types/query-variables";
import { createVariables } from "../utils/create-variables";
import { processSelection } from "../utils/process-selection";
import { toStartCase } from "../utils/start-case";

export type FindByParams<T, K, M> = BaseQuery &
  QueryVariables<M> & {
    where: T;
    select: K;
  };

export function findBy<T, K, M>(findByParams: FindByParams<T, K, M>) {
  const {
    where,
    select,
    entityName,
    queryName = `findBy${toStartCase(entityName).replace(/\s/g, "")}`,
    variables
  } = findByParams;

  const selectionNodes: SelectionNode[] = processSelection({
    condition: select
  });

  const variableDefinitionNodes = createVariables<unknown, M>(variables, [
    where
  ]);

  const whereNodes: ArgumentNode | undefined = where
    ? processArgument({ condition: where })
    : undefined;

  const ast: ASTNode = {
    kind: Kind.DOCUMENT, // FIRST NODE
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION, // TYPE OF OPERATION
        operation: OperationTypeNode.QUERY,
        variableDefinitions: variableDefinitionNodes,
        selectionSet: {
          kind: Kind.SELECTION_SET, // SELECT FIELDS
          selections: [
            {
              kind: Kind.FIELD,
              name: {
                kind: Kind.NAME,
                value: entityName
              },
              arguments: [whereNodes],
              selectionSet: {
                kind: Kind.SELECTION_SET,
                selections: selectionNodes
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
}
