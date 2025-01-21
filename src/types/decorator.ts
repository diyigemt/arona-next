import "reflect-metadata";
import { AbstractCommand } from "../command/AbstractCommand";
import { AbstractCommandSender } from "../command/CommandSender";
import { ClassType } from "../communication/types/Helper";
export enum ReflectMetadataKey {
  PROP_TYPE = "design:type", // 编译时属性类型
  PARAM_TYPES = "design:paramtypes", // 编译时函数入参类型
  RETURN_TYPE = "design:returntype", // 编译时函数返回类型
  ARONA_COMMAND = "ARONA_COMMAND",
  SUB_COMMAND_PARENT = "SUB_COMMAND_PARENT",
  COMMAND_NAME = "COMMAND_NAME",
  COMMAND_HANDLER_CONTEXT = "COMMAND_HANDLER_CONTEXT",
  COMMAND_HANDLER_PARAM = "COMMAND_HANDLER_PARAM",
}

export type CommandHandlerArgumentParam<T = string> = {
  description?: string;
  required?: boolean;
  defaultValue?: T;
  parser?: (raw: string) => T;
  type: "Argument";
};

export type CommandHandlerOptionParam<T = string> = {
  description?: string; // expected datatype
  shortName?: string; // -d
  argumentName?: string; // -d <datatype>
  defaultValue?: T; // use when asArgument=true
  parser?: (raw: string) => T;
  type: "Option";
};

export type CommandHandlerParamType<T = string> = CommandHandlerArgumentParam<T> | CommandHandlerOptionParam<T>;
export type CommandHandlerParamTypeMap = Map<string, CommandHandlerParamType>;

export function AronaCommand(commandName: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(ReflectMetadataKey.ARONA_COMMAND, commandName, target);
  };
}

export function SubCommand(commandName: string, parent: ClassType<AbstractCommand>): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(ReflectMetadataKey.SUB_COMMAND_PARENT, parent, target);
    Reflect.defineMetadata(ReflectMetadataKey.COMMAND_NAME, commandName, target);
  };
}

export function ActionHandler(ctx: ClassType<AbstractCommandSender>): MethodDecorator {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(ReflectMetadataKey.COMMAND_HANDLER_CONTEXT, ctx, descriptor.value as never);
  };
}

export function CommandArgument(config: Omit<CommandHandlerArgumentParam, "type"> = {}): PropertyDecorator {
  return (target, propertyKey) => {
    const map: CommandHandlerParamTypeMap =
      Reflect.getOwnMetadata(ReflectMetadataKey.COMMAND_HANDLER_PARAM, target) ?? new Map();
    map.set(propertyKey as string, {
      ...config,
      type: "Argument",
    });
    Reflect.defineMetadata(ReflectMetadataKey.COMMAND_HANDLER_PARAM, map, target);
  };
}

export function CommandOption(config: Omit<CommandHandlerOptionParam, "type"> = {}): PropertyDecorator {
  return (target, propertyKey) => {
    const map: CommandHandlerParamTypeMap =
      Reflect.getOwnMetadata(ReflectMetadataKey.COMMAND_HANDLER_PARAM, target) ?? new Map();
    map.set(propertyKey as string, {
      ...config,
      type: "Option",
    });
    Reflect.defineMetadata(ReflectMetadataKey.COMMAND_HANDLER_PARAM, map, target);
  };
}
