import * as winston from "winston";
import "winston-daily-rotate-file";

const { format, transports } = winston;

const loggerFormatter: Parameters<typeof format.printf>[0] = ({ level, message, label, timestamp }) => {
  // @ts-ignore
  return `${timestamp} [${label}] ${level}: ${typeof message === "string" ? message : message.toString()}`;
};

const LoggerCache: { [key: string]: winston.Logger } = {};

export function NodeSimpleLogger(name: string) {
  if (!LoggerCache[name]) {
    LoggerCache[name] = winston.createLogger({
      level: "info",
      format: format.combine(
        format.label({ label: name }),
        format.timestamp({
          format: "YY-MM-DD HH:mm:ss.SSS",
        }),
        format.splat(),
        format.printf(loggerFormatter),
      ),
      transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
          filename: "log/arona-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "10m",
          level: "info",
          zippedArchive: true,
        }),
      ],
    });
  }
  return LoggerCache[name];
}
