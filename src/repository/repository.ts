import { DeleteParams } from "../operations/delete";
import { FindParams } from "../operations/find-all";
import { FindByParams } from "../operations/find-one";
import { SuscribeParams } from "../operations/suscribe-all";
import { SuscribeByParams } from "../operations/suscribe-one";
import { UpdateParams } from "../operations/update";
import { UpsertParams } from "../operations/upsert";

export type OperationsDictionary = {
  entityColumnsWithRelationsSelection: unknown;
  entityColumns: string | number | symbol;
  entitySetInput: unknown;
  entityInserInput: unknown;
  boolExpression: unknown;
  orderByExpressionList: unknown;
  scalarType: unknown;
  appendSetInput: unknown;
  prependSetInput: unknown;
};

export abstract class Repository<Operations extends OperationsDictionary> {
  abstract findBy(
    findByParams: FindByParams<
      Operations["boolExpression"],
      Operations["entityColumnsWithRelationsSelection"],
      Operations["scalarType"]
    >
  );
  abstract find(
    findParams: FindParams<
      Operations["entityColumnsWithRelationsSelection"],
      Operations["boolExpression"],
      Operations["orderByExpressionList"],
      Operations["entityColumns"],
      Operations["scalarType"]
    >
  );

  abstract update(
    updateParams: UpdateParams<
      Operations["boolExpression"],
      Operations["entitySetInput"],
      Operations["appendSetInput"],
      Operations["prependSetInput"],
      Operations["entityColumns"],
      Operations["scalarType"]
    >
  );

  abstract upsert(
    upsertParams: UpsertParams<
      Operations["entityInserInput"],
      Operations["entityColumns"]
    >
  );

  abstract delete(
    deleteParams: DeleteParams<
      Operations["boolExpression"],
      Operations["entityColumns"],
      Operations["scalarType"]
    >
  );

  abstract subscribeByUuid(
    subscribeByParams: SuscribeByParams<
      Operations["entityColumnsWithRelationsSelection"],
      Operations["scalarType"]
    >
  );

  abstract subscribe(
    subscribeParams: SuscribeParams<
      Operations["entityColumnsWithRelationsSelection"],
      Operations["boolExpression"],
      Operations["orderByExpressionList"],
      Operations["scalarType"]
    >
  );
}
