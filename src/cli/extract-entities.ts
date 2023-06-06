import { readFileSync } from "fs";
import { HasuraORMConfig, defaultConfig } from "../config/default-config";

export function extractEntities(
  schemaKeys: string[],
  config: HasuraORMConfig,
  patterns = []
) {
  const excludePatterns = config["excludePatterns"] || patterns;
  const excludedEntities = config["excludeEntities"] || [];

  return schemaKeys.filter((entityName) => {
    if (
      excludePatterns.some(
        (pattern) =>
          entityName.includes(pattern) || excludedEntities.includes(entityName)
      )
    ) {
      return false;
    }
    return true;
  });
}
