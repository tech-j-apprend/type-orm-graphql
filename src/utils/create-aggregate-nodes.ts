import { ASTNode, ArgumentNode, FieldNode, Kind } from "graphql";
import { AggregateExpression } from "../types/aggregate";
import { processSelection } from "./process-selection";

export function createAggregateNodes<T extends string | number | symbol>(
  aggregate: AggregateExpression<T>["aggregate"],
  entityName: string,
  argumentNodes: ArgumentNode[] = []
) {
  const { count, max, min, withQueryConditions = true } = aggregate;

  const aggregateName = `${entityName}_aggregate`;

  const countArgumentNodes: ArgumentNode[] = [];

  if (typeof count === "object") {
    if (count.columns !== undefined) {
      countArgumentNodes.push({
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: "columns"
        },
        value: {
          kind: Kind.ENUM,
          value: count.columns.toString()
        }
      });
    }

    if (count.distinc !== undefined) {
      countArgumentNodes.push({
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: "distinct"
        },
        value: {
          kind: Kind.BOOLEAN,
          value: count.distinc
        }
      });
    }
  }

  const countNode: FieldNode | undefined =
    count !== undefined
      ? {
          kind: Kind.FIELD,
          name: {
            kind: Kind.NAME,
            value: "count"
          },
          arguments: countArgumentNodes
        }
      : undefined;

  const maxNode: FieldNode | undefined =
    max !== undefined
      ? {
          kind: Kind.FIELD,
          name: {
            kind: Kind.NAME,
            value: "max"
          },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: processSelection({
              condition: max
            })
          }
        }
      : undefined;

  const minNode: FieldNode | undefined =
    min !== undefined
      ? {
          kind: Kind.FIELD,
          name: {
            kind: Kind.NAME,
            value: "min"
          },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: processSelection({
              condition: min
            })
          }
        }
      : undefined;

  const aggregateArgumentNodes = [];

  if (withQueryConditions) {
    aggregateArgumentNodes.push(...argumentNodes);
  }

  const astNode: FieldNode = {
    kind: Kind.FIELD,
    name: {
      kind: Kind.NAME,
      value: aggregateName
    },
    arguments: aggregateArgumentNodes,
    selectionSet: {
      kind: Kind.SELECTION_SET,
      selections: [
        {
          kind: Kind.FIELD,
          name: {
            kind: Kind.NAME,
            value: "aggregate"
          },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [countNode, maxNode, minNode]
          }
        }
      ]
    }
  };
  return astNode;
}
