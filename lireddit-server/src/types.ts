import { Request, Response, Express } from "express";
import { Redis } from "ioredis";

export type MyContext = {
  req: Request & { session?: Express.Request };
  redis: Redis;
  res: Response;
};
