import { BaseQuery } from "../types/base-query";
import { QueryVariables } from "../types/query-variables";
import {
  ASTNode,
  Kind,
  OperationTypeNode,
  SelectionNode,
  print
} from "graphql";
import { processSelection } from "../utils/process-selection";
import { createVariables } from "../utils/create-variables";
import { createNodeValue } from "../utils/create-node-value";
import { toStartCase } from "../utils/start-case";

export type SuscribeByParams<T, K> = BaseQuery &
  QueryVariables<K> & {
    uuid: string;
    select: T;
  };

export function suscribeBy<T, K>(suscribeBy: SuscribeByParams<T, K>) {
  const {
    select,
    entityName = "",
    uuid,
    queryName = `suscribeByUuid${toStartCase(entityName).replace(/\s/g, "")}`,
    variables
  } = suscribeBy;

  const entityOperation = `${entityName}_by_pk`;
  const selectionNodes: SelectionNode[] = processSelection({
    condition: select
  });

  const variableDefinitionNodes = createVariables<unknown, K>(variables, [
    {
      uuid: {
        _eq: uuid
      }
    }
  ]);

  const ast: ASTNode = {
    kind: Kind.DOCUMENT, // FIRST NODE
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION, // TYPE OF OPERATION
        variableDefinitions: variableDefinitionNodes,
        operation: OperationTypeNode.SUBSCRIPTION,
        selectionSet: {
          kind: Kind.SELECTION_SET, // SELECT FIELDS
          selections: [
            {
              kind: Kind.FIELD,
              arguments: [
                // SUBSCRIPTION BY PK ARGUMENTS
                {
                  kind: Kind.ARGUMENT,
                  name: {
                    kind: Kind.NAME,
                    value: "uuid"
                  },
                  value: createNodeValue(uuid)
                }
              ],
              name: {
                kind: Kind.NAME,
                value: entityOperation
              },
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
