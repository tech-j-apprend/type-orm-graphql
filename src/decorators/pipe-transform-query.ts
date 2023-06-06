import { merge } from "lodash";

type TypedMethodDecorator = <T extends Function>(
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => any;

export const InjectEntityName: TypedMethodDecorator = <T>() => {
  return function (
    _target: Object,
    descriptor: TypedPropertyDescriptor<T> | void
  ) {
    const originalMethod = descriptor["value"];

    descriptor["value"] = function <T>(findByParams: T) {
      const baseQuery = this.getBaseQuery();
      const queryTransformed = merge(baseQuery, findByParams);

      return originalMethod.call(this, queryTransformed);
    };

    return descriptor;
  };
};
