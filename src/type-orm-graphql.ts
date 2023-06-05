#!/usr/bin/env node

import { program } from "commander";
import { defaultConfig } from "./config/default-config";
import { processSchema } from "./processor";

program
  .version("1.0.0")
  .description(
    "TypeOrmGraphql CLI tool for processing the schema and generating entities"
  )
  .name("type-orm-graphql")
  .arguments("[command]")
  .action((command) => {
    if (command) {
      console.log(`Unknown command: ${command}`);
    } else {
      program.outputHelp();
    }
  });

program
  .command("process-schema")
  .description("Processes the schema and generates the entities")
  .option(
    "-bd, --base-dependency-path <path>",
    "Base dependency path",
    defaultConfig().baseDependencyPath
  )
  .option(
    "-sp, --schema-path <path>",
    "Schema file path",
    defaultConfig().schemaPath
  )
  .option(
    "-gc, --hasura-config-path <path>",
    "Hasura config file path",
    defaultConfig().hasuraConfigPath
  )
  .option(
    "-tp, --types-config-path <path>",
    "Types config file path",
    defaultConfig().typesConfigPath
  )
  .option(
    "-ep, --export-path <path>",
    "Export path",
    defaultConfig().exportPath
  )
  .option(
    "-ee, --exclude-entities <list>",
    "Comma-separated list of excluded entities",
    defaultConfig().excludeEntities.join(",")
  )
  .option(
    "-epa, --exclude-patterns <list>",
    "Comma-separated list of exclude patterns",
    defaultConfig().excludePatterns.join(",")
  )
  .action(async (options) => {
    try {
      const config = defaultConfig();
      config.baseDependencyPath =
        options.baseDependencyPath || config.baseDependencyPath;
      config.schemaPath = options.schemaPath || config.schemaPath;
      config.hasuraConfigPath =
        options.hasuraConfigPath || config.hasuraConfigPath;
      config.typesConfigPath =
        options.typesConfigPath || config.typesConfigPath;
      config.exportPath = options.exportPath || config.exportPath;
      config.excludeEntities = options.excludeEntities
        ? options.excludeEntities.split(",")
        : config.excludeEntities;
      config.excludePatterns = options.excludePatterns
        ? options.excludePatterns.split(",")
        : config.excludePatterns;

      await processSchema(config);
      console.log("Schema processed successfully");
    } catch (error) {
      console.error("Error processing schema:", error.message);
    }
  });

program.parse(process.argv);
