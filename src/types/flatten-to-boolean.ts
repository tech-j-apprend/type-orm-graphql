export type FlattenToBoolean<T> = {
  [K in keyof T]: T[K] extends (infer U)[]
    ? U extends object
      ? FlattenToBoolean<Partial<U>>
      : boolean
    : T[K] extends object
    ? FlattenToBoolean<Partial<T[K]>>
    : boolean;
};
