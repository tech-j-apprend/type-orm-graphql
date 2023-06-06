import { existsSync, readFileSync, rmSync } from "fs";
import { get, groupBy } from "lodash";
import { createEntityRepository } from "./create-entity-repository";
import { extractEntities } from "../utils/extract-entities";
import { SchemaItemType } from "../types/schema-item-type";
import { createTypesAndSchemaFiles } from "../utils/create-types-schema-files";
import { defaultConfig } from "../config/default-config";
import * as dotenv from "dotenv";
dotenv.config();

const readFile = (path: string) => readFileSync(path, "utf8");

/**
 *  Processes the schema and generates the entities based on the hasura-orm.config.json file
 */
export const processSchema = async (config = defaultConfig()) => {
  if (existsSync(config["exportPath"])) {
    rmSync(config["exportPath"], { recursive: true, force: true });
  }

  const hasuraConfigPath = config["hasuraConfigPath"];
  try {
    config = JSON.parse(readFileSync(hasuraConfigPath, "utf-8"));
  } catch (error) {
    console.log(
      `No config file found at ${hasuraConfigPath} , using default config`
    );
  }

  await createTypesAndSchemaFiles(config);

  let schema;
  try {
    schema = JSON.parse(readFile(config["schemaPath"]).toString());
  } catch (error) {
    throw new Error(
      `No schema file found at ${config["schemaPath"]} please configure respective path in the hasura-orm.config.json file`
    );
  }
  const types = get(schema, "__schema.types", []);
  const groups = groupBy(types, "kind");
  // Generates a group based on the kind of the schema items
  const groupsByKind = Object.keys(groups).map((key) => ({
    [key]: groupBy(groups[key], "name")
  }));

  // Extracts the objects from the schema
  const objects = groupsByKind.find((item) => {
    if (item[SchemaItemType.OBJECT]) {
      return true;
    }
    return false;
  });

  // Transform the objects into entities depending on the excludePatterns and excludeentities
  const entities = extractEntities(Object.keys(objects[SchemaItemType.OBJECT]));

  for (const entity of entities) {
    createEntityRepository(groupsByKind, entity);
  }
};
