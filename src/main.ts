import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import * as YAML from "yaml";
import * as fs from "node:fs";
import { Bot } from "./communication/Bot";
import { AronaConfig } from "./types";
import { registerAllCommand } from "./command/CommandManager";
import "reflect-metadata";
import { initTerminal } from "./logger/Console";
import { NestLogger } from "./logger/NestLogger";

const config = YAML.parse(fs.readFileSync("./config.yaml", "utf8")) as AronaConfig;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: new NestLogger(),
  });

  await app.listen(config.web.port ?? 8080, process.env.HOST ?? "0.0.0.0");
}

registerAllCommand();

const bot = new Bot(config.bot);
bot.login();

bootstrap().then();

initTerminal();

// const main = new Command("main");
// const sub = main.command("sub");
// main.action(async () => {
//   console.log("main");
// });
// sub.action(async () => {
//   console.log("sub");
// });
// main.hook("preAction", (thisC, actionC) => {
//   console.log(`main preAction, this=${thisC.name()}, actionC=${actionC.name()}`);
// });
// sub.hook("preAction", (thisC, actionC) => {
//   console.log(`sub preAction, this=${thisC.name()}, actionC=${actionC.name()}`);
// });
// main.exitOverride();
// main.parseAsync(["sub"], { from: "user" }).then();
//
// const key = Symbol("key");
// function Argument(): PropertyDecorator {
//   return (target, propertyKey) => {
//     console.log(propertyKey);
//     Reflect.defineMetadata(key, propertyKey, target);
//   };
// }
//
// class Main {
//   @Argument()
//   private name: string;
//   @Argument()
//   private name4: string;
//   @Argument()
//   private name3: string;
//   constructor() {
//     const mt = Reflect.getMetadata(key, this);
//     if (mt) {
//       Reflect.set(this, mt, "name");
//     }
//   }
//   whois() {
//     console.log(this.name);
//   }
// }
//
// const main = new Main();
// Reflect.set(main, "name", "override");
// main.whois();
