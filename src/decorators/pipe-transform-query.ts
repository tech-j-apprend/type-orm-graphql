import { merge } from "lodash";

export function InjectEntityName() {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function <T>(findByParams: T) {
      const baseQuery = this.getBaseQuery();
      const queryTransformed = merge(baseQuery, findByParams);

      return originalMethod.call(this, queryTransformed);
    };

    return descriptor;
  };
}
