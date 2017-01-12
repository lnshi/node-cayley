'use strict';

const CommonImport = require('../../util/CommonImport');

const Path = require('./Path');

class Query extends Path {

  constructor(calls, promisify) {
    super(calls);
    this._promisify = promisify;
    this.constructor._generateFuncs4Query.apply(this);
  }

  static _getGremlinText() {
    if (!this._calls.length) {
      return '';
    }
    let gremlinText = 'g.';
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
          gremlinText += (array[idx - 1] + '(' + params + ').');
        } else {
          gremlinText += (array[idx - 1] + '().');
        }
      }
    });
    return gremlinText.slice(0, -1);
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
            throw new Error("Missed 'gremlinCallback' function for 'query."
              + funcName + "(gremlinCallback, callback)', or 'query."
              + funcName + "(limit, gremlinCallback, callback).");
          }
        }
        this._calls.push(funcName, args);
        const gremlinText = this.constructor._getGremlinText.apply(this);
        if (!gremlinText) {
          throw new Error('Invalid gremlin text.');
        }
        if (this._promisify) {
          return CommonImport.Promise.promisify(this._query)(gremlinText);
        } else {
          this._query(gremlinText, lastArg);
        } 
      };
    };

    ['All', 'GetLimit', 'ToArray', 'ToValue', 'TagArray', 'TagValue', 'ForEach', 'Map'].forEach(generator);

  }

}

module.exports = Query;


