import { BaseQuery } from "../types/base-query";
import { QueryVariables } from "../types/query-variables";
import {
  ASTNode,
  ArgumentNode,
  Kind,
  OperationTypeNode,
  SelectionNode,
  print
} from "graphql";
import { processSelection } from "../utils/process-selection";
import { createVariables } from "../utils/create-variables";
import { processArgument } from "../utils/process-argument";
import { createPrimitiveArgumentNode } from "../utils/create-primitive-argument-node";
import { toStartCase } from "../utils/start-case";

export type SuscribeParams<T, K, M, S> = BaseQuery &
  QueryVariables<S> & {
    select: T;
    limit?: number;
    offset?: number;
    where?: K;
    orderBy?: M;
  };

export function suscribe<T, K, M, S>(suscribeBy: SuscribeParams<T, K, M, S>) {
  const {
    select,
    limit,
    offset,
    where,
    orderBy,
    entityName,
    variables,
    queryName = `suscribeAll${toStartCase(entityName).replace(/\s/g, "")}`
  } = suscribeBy;

  const selectionNodes: SelectionNode[] = processSelection({
    condition: select
  });

  const variableDefinitionNodes = createVariables<unknown, S>(variables, [
    where
  ]);

  const whereNodes: ArgumentNode | undefined = where
    ? processArgument({ condition: where })
    : undefined;

  const orderByNodes: ArgumentNode | undefined = orderBy
    ? processArgument({
        condition: orderBy,
        ast: {
          kind: Kind.ARGUMENT,
          name: {
            kind: Kind.NAME,
            value: "order_by"
          },
          value: {
            kind: Kind.OBJECT,
            fields: []
          }
        },
        enumValues: ["asc", "desc"]
      })
    : undefined;

  const limitNode: ArgumentNode | undefined =
    limit !== undefined
      ? createPrimitiveArgumentNode("limit", limit)
      : undefined;

  const offsetNode: ArgumentNode | undefined =
    offset !== undefined
      ? createPrimitiveArgumentNode("offset", offset)
      : undefined;

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
              name: {
                kind: Kind.NAME,
                value: entityName
              },
              arguments: [whereNodes, orderByNodes, limitNode, offsetNode],
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
