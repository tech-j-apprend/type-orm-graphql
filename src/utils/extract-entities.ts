import { readFileSync } from "fs";
import { defaultConfig } from "../config/default-config";

export function extractEntities(schemaKeys: string[], patterns = []) {
  let config = defaultConfig();
  const hasuraConfigPath = config["hasuraConfigPath"];
  try {
    config = JSON.parse(readFileSync(hasuraConfigPath, "utf-8"));
  } catch (error) {
    console.log(
      `No config file found at ${hasuraConfigPath} , using default config`
    );
  }

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
