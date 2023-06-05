import { ArgumentNode, Kind } from "graphql";
import { createNodeValue } from "./create-node-value";

export const createPrimitiveArgumentNode = (
  argumentName: string,
  value: string | number | boolean
): ArgumentNode => {
  return {
    kind: Kind.ARGUMENT,
    name: {
      kind: Kind.NAME,
      value: argumentName
    },
    value: createNodeValue(value)
  };
};
