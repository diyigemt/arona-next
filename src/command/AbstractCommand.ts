import { Command } from "@commander-js/extra-typings";
import { isConstructor, isFunction } from "../utils";
import {
  CommandHandlerArgumentParam,
  CommandHandlerOptionParam,
  CommandHandlerParamTypeMap,
  ReflectMetadataKey,
} from "../types/decorator";
import { findCommandDeclaration } from "./CommandManager";

export abstract class AbstractCommand extends Command {
  protected get ctx(): Map<string, unknown> {
    return Reflect.get(this, "_ctx") as Map<string, unknown>;
  }

  protected constructor(commandName: string) {
    super(commandName);
    Reflect.set(this, "_ctx", new Map<string, unknown>());
    const prototype = Object.getPrototypeOf(this);
    const methodsNames = Object.getOwnPropertyNames(prototype).filter(
      (it) =>
        !isConstructor(it) &&
        isFunction(prototype[it]) &&
        Reflect.getMetadata(ReflectMetadataKey.COMMAND_HANDLER_CONTEXT, prototype[it]),
    );
    const declaration = findCommandDeclaration(this.constructor.name);

    if (methodsNames.length > 0) {
      const methodName = methodsNames[0];
      const handlerFn = prototype[methodName];
      // 注册argument和option
      const typeMap: CommandHandlerParamTypeMap =
        Reflect.getMetadata(ReflectMetadataKey.COMMAND_HANDLER_PARAM, this) ?? new Map();
      const argumentTypeList = [...typeMap.entries()].filter(([_, v]) => v.type === "Argument");
      const optionsTypeList = [...typeMap.entries()].filter(([_, v]) => v.type === "Option");
      argumentTypeList.forEach(([k, v]) => {
        const tmp = v as CommandHandlerArgumentParam;
        const c = tmp.required ? `<${k}>` : `[${k}]`;
        if (v.defaultValue) {
          this.argument(c, v.description ?? "", v.defaultValue);
        } else {
          this.argument(c, v.description ?? "");
        }
      });
      optionsTypeList.forEach(([k, v]) => {
        const tmp = v as CommandHandlerOptionParam;
        let c = `--${k}`;
        if (tmp.shortName) {
          c = `-${tmp.shortName}, ${c}`;
        }
        if (tmp.argumentName) {
          c = `${c} <${tmp.argumentName}>`;
        }
        if (v.defaultValue) {
          this.option(c, v.description ?? "");
        } else {
          this.option(c, v.description ?? "", v.defaultValue);
        }
      });
      this.exitOverride((error) => {
        console.log(this.helpInformation());
      });
      this.action(async (...arg: unknown[]) => {
        // argList组成: argument1,argument2,...,optionsMap,this
        // 如果argument是可选参数, 那么对应参数未传会给undefined
        // 按顺序写入arg
        const args: unknown[] = [this.ctx.get("_ctx")];
        argumentTypeList.forEach((k, idx) => {
          args.push(arg[idx]);
          Reflect.set(this, k[0], arg[idx]);
        });
        const optionsMap = arg[argumentTypeList.length] ?? {};
        optionsTypeList.forEach(([k, it]) => {
          const tmp = Reflect.get(optionsMap as Record<string, unknown>, k) ?? undefined;
          args.push(tmp);
          Reflect.set(this, k[0], tmp);
        });
        await handlerFn.apply(this, args);
      });
    }
  }
}
