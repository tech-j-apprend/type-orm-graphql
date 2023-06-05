import { generate } from "@graphql-codegen/cli";
import { HasuraORMConfig } from "../config/default-config";

/**
 * Generates types and schema files from the GraphQL endpoint
 * @description it uses the following secrets that are defined in the .env file at ```process.env.HASURA_GRAPHQL_URL``` and ```process.env.HASURA_GRAPHQL_ADMIN_SECRET```
 * to generate the files.
 * if no secrets provided you should set the secrets in the ```createSchemaAndTypes``` key located in the ```hasura-orm.config.json``` file, or instead
 * define the schemaPath and typesConfigPath in the ```hasura-orm.config.json``` file to point at the respective files.
 *
 * @param config type-orm-configuration
 */
export const createTypesAndSchemaFiles = async (config: HasuraORMConfig) => {
  const graphqlSchemaConfig = config["createSchemaAndTypes"];
  if (graphqlSchemaConfig) {
    const codegenConfig = {
      schema: [
        {
          [graphqlSchemaConfig["graphqlUrl"]]: {
            headers: {
              "x-hasura-admin-secret": graphqlSchemaConfig["hasuraAdminSecret"]
            }
          }
        }
      ],
      generates: {
        [config["schemaPath"]]: {
          plugins: ["introspection"],
          config: {}
        },
        [config["typesConfigPath"]]: {
          plugins: [
            "typescript",
            "typescript-operations",
            "named-operations-object"
          ],
          config: {
            enumsAsTypes: true,
            avoidOptionals: {
              field: true
            }
          }
        }
      }
    };

    await generate(codegenConfig, true);
  }
};
