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
import { toStartCase } from "../utils/start-case";

export type UpsertParams<T, K extends string | number | symbol> = BaseQuery & {
  objects: T[] | T;
  withAffectedRows?: boolean;
  returning: Partial<Record<K, boolean>>;
};

export const upsert = <T, K extends string | number | symbol>({
  objects,
  returning,
  withAffectedRows,
  entityName,
  queryName = `insert${toStartCase(entityName).replace(/\s/g, "")}`
}: UpsertParams<T, K>) => {
  const entityOperation = `insert_${entityName}`;
  const selectionNodes: SelectionNode[] = Object.keys(returning).map(
    (selection) => ({
      kind: Kind.FIELD,
      name: {
        kind: Kind.NAME,
        value: selection
      }
    })
  );

  const upsertElements: T[] = [];
  if (!Array.isArray(objects)) {
    upsertElements.push(objects);
  } else {
    upsertElements.push(...objects);
  }

  const upsertNodes: ArgumentNode = {
    kind: Kind.ARGUMENT,
    name: {
      kind: Kind.NAME,
      value: "objects"
    },
    value: {
      kind: Kind.LIST,
      values: upsertElements.map((upsertElement) =>
        processArgument({
          condition: upsertElement,
          ast: {
            kind: Kind.OBJECT,
            fields: []
          }
        })
      )
    }
  };

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
        selectionSet: {
          kind: Kind.SELECTION_SET, // SELECT FIELDS
          selections: [
            {
              kind: Kind.FIELD,
              name: {
                kind: Kind.NAME,
                value: entityOperation
              },
              arguments: [upsertNodes],
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
