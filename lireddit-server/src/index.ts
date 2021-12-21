import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { COOKIES_NAME, __prod__ } from "./constants";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import cors from "cors";
import { sendEmail } from "./utils/sendEmail";
import { User } from "./entities/User";

const main = async () => {
  sendEmail("bob@bob.com", "hey there");
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  //const post = orm.em.create(Post, { title: "my first post" });
  //await orm.em.persistAndFlush(post);
  //const posts = await orm.em.find(Post, {});
  //console.log(posts);

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    "/",
    session({
      name: COOKIES_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      },
      saveUninitialized: false,
      secret: "keyboard cat",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res, redis }),
  });

  apolloServer.start().then((res) => {
    apolloServer.applyMiddleware({
      app,
      cors: false,
    });
    app.listen(4000, () => {
      console.log("server started on localhost:4000");
    });
  });
};

main().catch((err) => {
  console.error(err);
});

console.log("Hello world!!");