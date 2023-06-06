import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { startCase } from "lodash";
import { Dictionary } from "lodash";
import { compile } from "handlebars";
import { SchemaItemType } from "../types/schema-item-type.js";
import { HasuraORMConfig } from "../config/default-config.js";
import * as path from "path";

const readFile = (path: string) => readFileSync(path, "utf8");

export function createEntityRepository(
  schema: {
    [x: string]: Dictionary<any[]>;
  }[],
  entityName: string,
  config: HasuraORMConfig
) {
  const relativePath = path.join(
    __dirname,
    "..",
    "templates",
    "base-repository.hbs"
  );
  const entityRepositoryTemplate = compile(readFile(relativePath));
  const variablesToResolve = {};

  variablesToResolve["base_dependency_path"] = config["baseDependencyPath"];

  const typeKeyList = [
    {
      schemaPath: SchemaItemType.INPUT_OBJECT,
      value: "bool_exp"
    },
    {
      schemaPath: SchemaItemType.INPUT_OBJECT,
      value: "insert_input"
    },
    {
      schemaPath: SchemaItemType.INPUT_OBJECT,
      value: "order_by"
    },
    {
      schemaPath: SchemaItemType.INPUT_OBJECT,
      value: "set_input"
    },
    {
      schemaPath: SchemaItemType.INPUT_OBJECT,
      value: "append_input"
    },
    {
      schemaPath: SchemaItemType.INPUT_OBJECT,
      value: "prepend_input"
    },
    {
      schemaPath: SchemaItemType.ENUM,
      value: "select_column"
    },
    {
      schemaPath: SchemaItemType.ENUM,
      key: "scalar_type",
      value: "Scalars",
      type: "static"
    }
  ];
  const typeImports = [];

  typeKeyList.forEach(({ schemaPath, value, key, type }) => {
    const schemaObject = schema.find((schemaItem) => schemaItem[schemaPath])[
      schemaPath
    ];

    const entityTypeToResolve = [entityName, value].join("_");

    if (Object.keys(schemaObject).includes(entityTypeToResolve)) {
      const typeToResolve = startCase(entityTypeToResolve).replace(/\s/g, "_");
      variablesToResolve[value] = typeToResolve;
      typeImports.push(typeToResolve);
    } else {
      variablesToResolve[value] = "never";
    }

    if (type === "static") {
      variablesToResolve[key] = value;
      typeImports.push(value);
    }
  });

  const entityNameInCamelCase = startCase(entityName).replace(/\s/g, "_");
  variablesToResolve["table_name"] = entityName;
  variablesToResolve["entity_name"] = entityNameInCamelCase;
  variablesToResolve["class_name"] = startCase(entityName).replace(/\s/g, "");

  typeImports.push(entityNameInCamelCase);

  const repoDir = `${config["exportPath"]}/repositories/`;
  const relativeTypeImportPath = path
    .relative(repoDir, config["typesConfigPath"])
    .replace(/\\/g, "/");
  const relativeTypesImportPathWithOutExtension =
    relativeTypeImportPath.replace(".ts", "");

  const importStatement = `import {\n  ${typeImports.join(
    ",\n  "
  )} \n} from "${relativeTypesImportPathWithOutExtension}"`;

  variablesToResolve["repository_types"] = importStatement;

  const fileName = `${entityName.replace(/_/g, "-")}.ts`;

  if (!existsSync(repoDir)) {
    mkdirSync(repoDir, { recursive: true });
  }

  const entityRepository = entityRepositoryTemplate(variablesToResolve);
  writeFileSync(
    `${config["exportPath"]}/repositories/${fileName}`,
    entityRepository
  );
}
