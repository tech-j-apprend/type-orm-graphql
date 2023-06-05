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
import { createPrimitiveArgumentNode } from "../utils/create-primitive-argument-node";
import { BaseQuery } from "../types/base-query";
import { capitalize, startCase } from "lodash";
import { QueryVariables } from "../types/query-variables";
import { createVariables } from "../utils/create-variables";
import { processSelection } from "../utils/process-selection";
import { AggregateExpression } from "../types/aggregate";
import { createAggregateNodes } from "../utils/create-aggregate-nodes";

export type FindParams<
  T,
  K,
  M,
  N extends string | number | symbol,
  S
> = BaseQuery &
  QueryVariables<S> &
  AggregateExpression<N> & {
    select: T;
    limit?: number;
    offset?: number;
    where?: K;
    orderBy?: M;
  };

export function find<T, K, M, N extends string | number | symbol, S>(
  findParams: FindParams<T, K, M, N, S>
) {
  const {
    select,
    limit,
    offset,
    where,
    orderBy,
    entityName,
    variables,
    aggregate,
    queryName = `findAll${startCase(entityName).replace(/\s/g, "")}`
  } = findParams;

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

  const aggregateNode: FieldNode | undefined =
    aggregate !== undefined
      ? createAggregateNodes<N>(aggregate, entityName, [
          whereNodes,
          orderByNodes
        ])
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
            aggregateNode,
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
