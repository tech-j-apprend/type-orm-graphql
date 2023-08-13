export type HasuraORMConfig = {
  baseDependencyPath: string;
  schemaPath: string;
  createSchemaAndTypes?:
    | {
        graphqlUrl: string;
        headers: Record<string, string>;
      }
    | false;
  hasuraConfigPath?: string;
  templateName?: string;
  typesConfigPath?: string;
  exportPath?: string;
  excludeEntities?: string[];
  excludePatterns?: string[];
};

export const defaultConfig = (): HasuraORMConfig => ({
  createSchemaAndTypes: {
    graphqlUrl: process.env.HASURA_GRAPHQL_URL,
    headers: {
      'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET
    }
  },
  baseDependencyPath: "@tech-j-apprend/type-orm-graphql", //"../../../index",
  schemaPath: "./src/generated/hasura-orm/schema.json",
  hasuraConfigPath: "hasura-orm.config.json",
  exportPath: "./src/generated/hasura-orm",
  typesConfigPath: "./src/generated/hasura-orm/graphql.ts",
  templateName: "base-repository.hbs",
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
