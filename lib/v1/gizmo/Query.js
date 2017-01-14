'use strict';

const CommonImport = require('../../util/CommonImport');

const Path = require('./Path');

class Query extends Path {

  constructor(calls, promisify) {
    super(calls);
    this._promisify = promisify;
    this.constructor._generateFuncs4Query.apply(this);
  }

  static _getGizmoText() {
    if (!this._calls.length) {
      return '';
    }
    let gizmoText = 'g.';
    this._calls.forEach((item, idx, array) => {
      if (Array.isArray(item)) {
        const params = item.reduce((acc, curr, innerIdx) => {
          if (Number.isInteger(curr)) {
            acc += curr;
          } else if (typeof curr === 'function') {
            acc += curr.toString();
          } else {
            acc += ('"' + curr + '"');
          }
          if (innerIdx !== item.length - 1) {
            acc += ','
          }
          return acc;
        }, '');
        if (params) {
          gizmoText += (array[idx - 1] + '(' + params + ').');
        } else {
          gizmoText += (array[idx - 1] + '().');
        }
      }
    });
    return gizmoText.slice(0, -1);
  }

  static _generateFuncs4Query() {

    const generator = (funcName) => {
      this[funcName] = (...args) => {
        const lastArg = args[args.length - 1];
        if (typeof lastArg === 'function') {
          if (this._promisify) {
            CommonImport.logger.warn("'promisify' was set to true and 'callback' provided, 'callback' will be ignored.");
          }
          args.pop();
        } else {
          if (!this._promisify) {
            throw new Error("'promisify' was set to false, but no 'callback' provided.");
          }
        }
        /*
         * Special check for:
         *   - query.ForEach(callback), query.ForEach(limit, callback)
         *   - query.Map(callback), query.Map(limit, callback) <- alias of 'query.ForEach'
         */
        if (funcName === 'ForEach' || funcName === 'Map') {
          if (typeof args[args.length - 1] !== 'function') {
            throw new Error("Missed 'gizmoCallback' function for 'query."
              + funcName + "(gizmoCallback, callback)', or 'query."
              + funcName + "(limit, gizmoCallback, callback).");
          }
        }
        this._calls.push(funcName, args);
        const gizmoText = this.constructor._getGizmoText.apply(this);
        if (!gizmoText) {
          throw new Error('Invalid gizmo text.');
        }
        if (this._promisify) {
          return CommonImport.Promise.promisify(this._query)(gizmoText);
        } else {
          this._query(gizmoText, lastArg);
        } 
      };
    };

    ['All', 'GetLimit', 'ToArray', 'ToValue', 'TagArray', 'TagValue', 'ForEach', 'Map'].forEach(generator);

  }

}

module.exports = Query;


