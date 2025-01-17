/* eslint-disable no-console */
// @ts-nocheck
/*
 * console.js: Transport for outputting to the console.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

"use strict";

import { printAbove } from "./console";

import * as os from "os";

const LEVEL = Symbol.for("level");
const MESSAGE = Symbol.for("message");

import TransportStream from "winston-transport";

type Option = {
  name: string;
  stderrLevels: string[];
  consoleWarnLevels: string[];
  eol: string;
  forceConsole: boolean;
};
/**
 * Transport for outputting to the console.
 * @type {Console}
 * @extends {TransportStream}
 */
export class Console extends TransportStream {
  /**
   * Constructor function for the Console transport object responsible for
   * persisting log messages and metadata to a terminal or TTY.
   * @param {!Object} [options={}] - Options for this instance.
   */
  // @ts-ignore
  constructor(options: Option = {}) {
    super(options);

    // Expose the name of this Transport on the prototype
    this.name = options.name || "console";
    this.stderrLevels = this._stringArrayToSet(options.stderrLevels, undefined);
    this.consoleWarnLevels = this._stringArrayToSet(options.consoleWarnLevels, undefined);
    this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
    this.forceConsole = options.forceConsole || false;
    this.setMaxListeners(30);
  }

  /**
   * Core logging method exposed to Winston.
   * @param {Object} info - TODO: add param description.
   * @param {Function} callback - TODO: add param description.
   * @returns {undefined}
   */
  log(info, callback) {
    setImmediate(() => this.emit("logged", info));

    // Remark: what if there is no raw...?
    if (this.stderrLevels[info[LEVEL]]) {
      printAbove(info[MESSAGE], "error");
      if (callback) {
        callback(); // eslint-disable-line callback-return
      }
      return;
    } else if (this.consoleWarnLevels[info[LEVEL]]) {
      printAbove(info[MESSAGE], "warning");
      if (callback) {
        callback(); // eslint-disable-line callback-return
      }
      return;
    }
    printAbove(info[MESSAGE]);
    if (callback) {
      callback(); // eslint-disable-line callback-return
    }
  }

  /**
   * Returns a Set-like object with strArray's elements as keys (each with the
   * value true).
   * @param {Array} strArray - Array of Set-elements as strings.
   * @param {?string} [errMsg] - Custom error message thrown on invalid input.
   * @returns {Object} - TODO: add return description.
   * @private
   */
  _stringArrayToSet(strArray: unknown[], errMsg: string | undefined) {
    if (!strArray) return {};

    errMsg = errMsg || "Cannot make set from type other than Array of string elements";

    if (!Array.isArray(strArray)) {
      throw new Error(errMsg);
    }

    return strArray.reduce((set, el) => {
      if (typeof el !== "string") {
        throw new Error(errMsg);
      }
      set[el] = true;

      return set;
    }, {});
  }
}
