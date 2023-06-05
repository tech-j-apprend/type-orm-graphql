type LiteralTemplateKey<T> = keyof T extends string
  ? keyof T | `${keyof T}!`
  : keyof T;

export type QueryVariables<T> = {
  variables?: Record<string, LiteralTemplateKey<T>>;
};
