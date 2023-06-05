export type HasuraORMConfig = {
  baseDependencyPath: string;
  schemaPath: string;
  createSchemaAndTypes?:
    | {
        graphqlUrl: string;
        hasuraAdminSecret: string;
      }
    | false;
  hasuraConfigPath?: string;
  typesConfigPath?: string;
  exportPath?: string;
  excludeEntities?: string[];
  excludePatterns?: string[];
};

export const defaultConfig = (): HasuraORMConfig => ({
  createSchemaAndTypes: {
    graphqlUrl: process.env.HASURA_GRAPHQL_URL,
    hasuraAdminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET
  },
  baseDependencyPath: "../../../index", //"type-orm-graphql",
  schemaPath: "./src/schema.json",
  hasuraConfigPath: "hasura-orm.config.json",
  exportPath: "./src/generated/hasura-orm",
  typesConfigPath: "./src/generated/hasura-orm/graphql.ts",
  excludeEntities: [],
  excludePatterns: [
    "query_root",
    "subscription_root",
    "mutation_root",
    "_aggregate",
    "_max_fields",
    "_min_fields",
    "_mutation_response",
    "_aggregate_fields",
    "_fields",
    "__"
  ]
});
