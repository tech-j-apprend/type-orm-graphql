import { readFileSync } from "fs";
import { defaultConfig } from "../config/default-config";

export function readHasuraConfig() {
  let config = defaultConfig();
  const hasuraConfigPath = config["hasuraConfigPath"];
  try {
    config = JSON.parse(readFileSync(hasuraConfigPath, "utf-8"));
  } catch (error) {
    console.log(
      `No config file found at ${hasuraConfigPath} , using default config`
    );
  }
  return config;
}
