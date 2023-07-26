export function mergeObjects(target, ...sources) {
  if (typeof target !== "object" || target === null) {
    throw new Error("Target must be an object");
  }

  for (const source of sources) {
    if (typeof source !== "object" || source === null) {
      throw new Error("Source must be an object");
    }

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (Array.isArray(source[key])) {
          // Handle arrays separately by creating a new array and copying its elements
          target[key] = source[key].slice();
        } else if (typeof source[key] === "object" && source[key] !== null) {
          // Recursively merge nested objects
          if (
            !target[key] ||
            typeof target[key] !== "object" ||
            target[key] === null
          ) {
            target[key] = {};
          }
          mergeObjects(target[key], source[key]);
        } else {
          // Copy simple values or non-object types
          target[key] = source[key];
        }
      }
    }
  }

  return target;
}
