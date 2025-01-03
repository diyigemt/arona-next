import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import * as YAML from "yaml";
import * as fs from "node:fs";
import { Bot } from "./communication/Bot";
import { AronaConfig } from "./types";
import { registerAllCommand } from "./command/CommandManager";

const config = YAML.parse(fs.readFileSync("./config.yaml", "utf8")) as AronaConfig;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.listen(config.web.port ?? 8080, process.env.HOST ?? "0.0.0.0");
}

registerAllCommand();

const bot = new Bot(config.bot);
bot.login();

bootstrap().then();
