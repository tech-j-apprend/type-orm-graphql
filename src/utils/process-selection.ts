import { Kind, SelectionNode } from "graphql";

type ProcessSelectionParams = {
  condition: any;
  processedFields?: string[];
  enumValues?: string[];
};

/**
 * this method considers all the cases to evaluate behaviors in where clauses
 * instead of modyfing the original AST, it creates a new one and works with
 * arrays to prevent creating infinite loops.
 * It is in charge of creating the root nodes and then calling the process condition
 * method
 * @param condition the bool expression
 * @param ast the initial node to be processed
 * @param processedFields the fields that have already been processed
 * @returns
 */
export const processSelection = ({
  condition: where,
  enumValues = [],
  processedFields = []
}: ProcessSelectionParams): SelectionNode[] => {
  let selectionNodes: SelectionNode[] = [];

  const whereConditionMapped = where;

  for (const key of Object.keys(whereConditionMapped)) {
    if (!processedFields.includes(key)) {
      const fieldValue = whereConditionMapped[key];

      if (Array.isArray(fieldValue)) {
        const nestedFields: SelectionNode[] = [];
        for (let i = 0; i < fieldValue.length; i++) {
          const nestedField = processSelection({
            condition: fieldValue[i],
            enumValues,
            processedFields: [...processedFields, key]
          });
          nestedFields.push({
            kind: Kind.INLINE_FRAGMENT,
            typeCondition: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: key
              }
            },
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: nestedField
            }
          });
        }

        if (nestedFields.length > 0) {
          const fieldNode: SelectionNode = {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: key
            },
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: nestedFields
            }
          };
          selectionNodes.push(fieldNode);
        }
      } else if (typeof fieldValue === "object") {
        const nestedFields = processSelection({
          condition: fieldValue,
          enumValues,
          processedFields: [...processedFields, key]
        });
        if (nestedFields.length > 0) {
          const fieldNode: SelectionNode = {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: key
            },
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: nestedFields
            }
          };
          selectionNodes.push(fieldNode);
        }
      } else {
        const fieldNode: SelectionNode = {
          kind: Kind.FIELD,
          name: {
            kind: Kind.NAME,
            value: key
          }
        };
        selectionNodes.push(fieldNode);
      }
    }
  }

  return selectionNodes;
};
