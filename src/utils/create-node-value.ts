import { Kind, ValueNode } from "graphql";

export const createNodeValue = (
  value: string | number | boolean | undefined,
  enumValues = []
): ValueNode | undefined => {
  if (typeof value === "number") {
    return {
      kind: Kind.FLOAT,
      value: value.toString()
    };
  } else if (typeof value === "string") {
    if (enumValues.includes(value)) {
      return {
        kind: Kind.ENUM,
        value
      };
    } else if (value.startsWith("$")) {
      return {
        kind: Kind.VARIABLE,
        name: {
          kind: Kind.NAME,
          value: value.slice(1)
        }
      };
    } else {
      return {
        kind: Kind.STRING,
        value
      };
    }
  } else if (typeof value === "boolean") {
    return {
      kind: Kind.BOOLEAN,
      value
    };
  } else if (typeof value === "undefined") {
    return undefined;
  }

  return undefined;
};
