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
