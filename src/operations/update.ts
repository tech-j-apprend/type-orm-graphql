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
import { startCase } from "lodash";
import { BaseQuery } from "../types/base-query";
import { createVariables } from "../utils/create-variables";
import { QueryVariables } from "../types/query-variables";

export type UpdateParams<
  T,
  K,
  M,
  N,
  S extends string | number | symbol,
  L
> = BaseQuery &
  QueryVariables<L> & {
    where: T;
    set: K;
    append?: M;
    prepend?: N;
    returning: Partial<Record<S, boolean>>;
    withAffectedRows?: boolean;
  };

export const update = <T, K, M, N, S extends string | number | symbol, L>({
  where,
  set,
  returning,
  append,
  prepend,
  withAffectedRows = false,
  entityName,
  queryName = `update${startCase(entityName).replace(/\s/g, "")}`,
  variables
}: UpdateParams<T, K, M, N, S, L>) => {
  const entityOperation = `update_${entityName}`;

  const selectionNodes: SelectionNode[] = Object.keys(returning).map(
    (selection) => ({
      kind: Kind.FIELD,
      name: {
        kind: Kind.NAME,
        value: selection
      }
    })
  );

  const whereNodes: ArgumentNode | undefined = where
    ? processArgument({ condition: where })
    : undefined;

  const variableDefinitionNodes = createVariables<unknown, L>(variables, [
    where,
    set,
    append,
    prepend
  ]);

  const setNodes: ArgumentNode = processArgument({
    condition: set,
    ast: {
      kind: Kind.ARGUMENT,
      name: {
        kind: Kind.NAME,
        value: "_set"
      },
      value: {
        kind: Kind.OBJECT,
        fields: []
      }
    }
  });

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

  const appendNodes: ArgumentNode | undefined = append
    ? processArgument({
        condition: append,
        ast: {
          kind: Kind.ARGUMENT,
          name: {
            kind: Kind.NAME,
            value: "_append"
          },
          value: {
            kind: Kind.OBJECT,
            fields: []
          }
        }
      })
    : undefined;

  const prependNodes: ArgumentNode | undefined = prepend
    ? processArgument({
        condition: prepend,
        ast: {
          kind: Kind.ARGUMENT,
          name: {
            kind: Kind.NAME,
            value: "_prepend"
          },
          value: {
            kind: Kind.OBJECT,
            fields: []
          }
        }
      })
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
              arguments: [whereNodes, setNodes, appendNodes, prependNodes],
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
