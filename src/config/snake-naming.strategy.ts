import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";

function snakeCase(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").replace(/^_/, "").toLowerCase();
}

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName || snakeCase(className);
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    const prefix = embeddedPrefixes.length
      ? snakeCase(embeddedPrefixes.join("_")) + "_"
      : "";
    return prefix + (customName || snakeCase(propertyName));
  }

  relationName(propertyName: string): string {
    return propertyName;
  }

  joinColumnName(
    relationName: string,
    referencedColumnName: string,
  ): string {
    return snakeCase(relationName) + "_" + snakeCase(referencedColumnName);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
  ): string {
    return firstTableName + "_" + secondTableName;
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return tableName + "_" + (columnName || snakeCase(propertyName));
  }
}
