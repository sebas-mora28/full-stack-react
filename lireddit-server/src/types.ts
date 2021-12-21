import { IDatabaseDriver, EntityManager, Connection } from "@mikro-orm/core";
import { Request, Response, Express } from "express";
import { Redis } from "ioredis";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session?: Express.Request };
  redis: Redis;
  res: Response;
};
