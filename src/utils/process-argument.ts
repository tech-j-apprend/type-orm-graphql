import { ASTNode, Kind, ObjectValueNode, visit } from "graphql";
import { processCondition } from "./process-condition";
import { createNodeValue } from "./create-node-value";

type ProcessArgumentParams = {
  condition: any;
  ast?: any;
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
export const processArgument = ({
  condition: where,
  ast = {
    kind: Kind.ARGUMENT,
    name: {
      kind: Kind.NAME,
      value: "where"
    },
    value: {
      kind: Kind.OBJECT,
      fields: []
    }
  },
  enumValues = [],
  processedFields = []
}: ProcessArgumentParams) => {
  const updatedAst = visit(ast, {
    ObjectValue: {
      enter: (node: ObjectValueNode) => {
        let newFields = [...node.fields];
        let whereConditionMapped = undefined;
        if (Array.isArray(where)) {
          whereConditionMapped = where.reduce((acc, objectToFlat) => {
            return {
              ...acc,
              ...objectToFlat
            };
          }, {});
        } else {
          whereConditionMapped = where;
        }

        for (const key of Object.keys(whereConditionMapped)) {
          if (
            (key === "_and" || key === "_or" || key === "order_by") &&
            !processedFields.includes(key)
          ) {
            const conditionArray = whereConditionMapped[key];

            const arrayNode: ASTNode = {
              kind: Kind.OBJECT_FIELD,
              name: {
                kind: Kind.NAME,
                value: key
              },
              value: {
                kind: Kind.OBJECT,
                fields: []
              }
            };

            const arrayNodeFields = conditionArray.flatMap((condition) => {
              return processCondition(condition, enumValues);
            });

            arrayNode.value["fields"].push(...arrayNodeFields);
          } else if (
            typeof whereConditionMapped[key] === "object" &&
            !processedFields.includes(key)
          ) {
            const condition = whereConditionMapped[key];

            const objectConditionNode: ASTNode = {
              kind: Kind.OBJECT_FIELD,
              name: {
                kind: Kind.NAME,
                value: key
              },
              value: {
                kind: Kind.OBJECT,
                fields: processCondition(condition, enumValues)
              }
            };

            newFields.push(objectConditionNode);
            processedFields.push(key); // Mark field as processed
          } else if (!processedFields.includes(key)) {
            const primitiveValue = whereConditionMapped[key];
            newFields.push({
              kind: Kind.OBJECT_FIELD,
              name: {
                kind: Kind.NAME,
                value: key
              },
              value: createNodeValue(primitiveValue, enumValues)
            });
            processedFields.push(key); // Mark field as processed
          }
        }

        return {
          ...node,
          fields: newFields
        };
      }
    }
  });

  return updatedAst;
};
