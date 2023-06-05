export type AggregateParams<T extends string | number | symbol> = {
  count:
    | Partial<{
        columns: T;
        distinc: boolean;
      }>
    | boolean;
  max: Partial<Record<T, boolean>>;
  min: Partial<Record<T, boolean>>;
  withQueryConditions?: boolean;
};

export type AggregateExpression<T extends string | number | symbol> = {
  aggregate?: Partial<AggregateParams<T>>;
};
