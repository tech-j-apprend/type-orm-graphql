import { Kind } from "graphql";
import { createNodeValue } from "./create-node-value";

/**
 * This method processes the where clause of a findAll request, recursively
 * evaluating the conditions and creating the AST nodes.
 * Clauses considered:
 * _and and _or. ie: { _and {owner_uid: {_eq: ":uuid"}, name: {_eq: ":name"}}}
 * object relationships. ie: { rel_status: { name: {_eq: ":name"}}}
 * primitive expressions: ie: { name: {_eq: ":name"}}
 * @param condition
 * @returns
 */
export const processCondition = (condition: any, enumValues = []) => {
  if (typeof condition === "object" && condition !== null) {
    if ("_and" in condition || "_or" in condition) {
      const conjunctionKey = "_and" in condition ? "_and" : "_or";
      const conjunctionArray = condition[conjunctionKey];

      return {
        kind: Kind.OBJECT_FIELD,
        name: {
          kind: Kind.NAME,
          value: conjunctionKey
        },
        value: {
          kind: Kind.OBJECT,
          fields: conjunctionArray.flatMap((currentCondition) =>
            processCondition(currentCondition, enumValues)
          )
        }
      };
    } else {
      return Object.keys(condition).flatMap((conditionKey) => {
        const value = condition[conditionKey];
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          return {
            kind: Kind.OBJECT_FIELD,
            name: {
              kind: Kind.NAME,
              value: conditionKey
            },
            value: {
              kind: Kind.OBJECT,
              fields: processCondition(value)
            }
          };
        } else if (Array.isArray(value) && value !== null) {
          return {
            kind: Kind.OBJECT_FIELD,
            name: {
              kind: Kind.NAME,
              value: conditionKey
            },
            value: {
              kind: Kind.LIST,
              values: value.map((arrayItem) => ({
                kind: Kind.STRING,
                value: arrayItem
              }))
            }
          };
        } else {
          return {
            kind: Kind.OBJECT_FIELD,
            name: {
              kind: Kind.NAME,
              value: conditionKey
            },
            value: createNodeValue(value, enumValues)
          };
        }
      });
    }
  } else {
    return [];
  }
};
