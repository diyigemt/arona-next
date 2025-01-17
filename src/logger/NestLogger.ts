/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService, Injectable } from "@nestjs/common";
import { NodeSimpleLogger } from ".";

@Injectable()
export class NestLogger implements LoggerService {
  private logger = NodeSimpleLogger("nestjs");
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message);
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message);
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug(message);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message);
  }
}
