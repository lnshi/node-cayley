'use strict';

const CommonImport = require('../../util/CommonImport');

const utils = require('../../util/Util');

const Path = require('./Path');

class Query extends Path {

  constructor(calls, promisify) {
    super(calls);
    this._promisify = promisify;
    this.constructor._generateFuncs4Query.apply(this);
  }

  static _getGizmoText() {
    let gizmoText = 'g.';
    this._calls.forEach((item, idx, array) => {
      if (Array.isArray(item)) {
        let params;
        if (['V', 'Vertex'].indexOf(array[idx - 1]) !== -1) {
          if (Array.isArray(item[0])) {
            params = JSON.stringify(item[0]).slice(1, -1);
          } else {
            params = '"' + item[0] + '"';
          }
        } else if (['Out', 'In'].indexOf(array[idx - 1]) !== -1) {
          params = JSON.stringify(item).slice(1, -1);
        } else if (['Follow', 'FollowR'].indexOf(array[idx - 1]) !== -1) {
          params = this.constructor._getGizmoText.apply(item[0]);
        } else {
          params = item.reduce((acc, curr, innerIdx) => {
            if (Number.isInteger(curr)) {
              acc += curr;
            } else if (typeof curr === 'function') {
              if (array[idx - 1] === 'ForEach' || array[idx - 1] === 'Map') {
                acc += curr.toString();
              }
            } else {
              acc += ('"' + curr + '"');
            }
            if (innerIdx !== item.length - 1) {
              acc += ','
            }
            return acc;
          }, '');
        }
        if (params) {
          gizmoText += (array[idx - 1] + '(' + params + ').');
        } else {
          switch (array[idx - 1]) {
            case 'ToArray':
            case 'ToValue':
            case 'TagArray':
            case 'TagValue':
              const gizmoFuncStr = array[idx][0].toString().replace(/\r?\n|\r/g, '').replace(/\s+/g, ' ');
              const gizmoFuncFP = gizmoFuncStr.match(/\(([^(]+)\)/)[1];
              const gizmoFuncBody = gizmoFuncStr.match(/{(.*)}/)[1];
              const gizmoFuncNewFP = 'lnshi_' + CommonImport.shortid.generate();
              const replaceFPRegExp = new RegExp('\\b' + utils.escapeRegExp(gizmoFuncFP) + '\\b', 'g');
              gizmoText = 'var ' + gizmoFuncNewFP + '=' + gizmoText + array[idx - 1] + '();'
                            + gizmoFuncBody.replace(replaceFPRegExp, gizmoFuncNewFP) + '.';
              break;
            default:
              gizmoText += (array[idx - 1] + '().');
          }
        }
      }
    });
    return gizmoText.slice(0, -1);
  }

  static _generateFuncs4Query() {

    const generator = (funcName) => {
      this[funcName] = (...args) => {
        let callback;
        if (!this._promisify) {
          callback = args.pop();
        }
        if (!this._promisify && typeof callback !== 'function') {
          throw new Error("Missed 'callback' for callback style API: 'query." + funcName + "'.");
        }
        if (funcName !== 'All' && funcName !== 'GetLimit' && typeof args[args.length - 1] !== 'function') {
          throw new Error("Missed 'gizmoFunc' for " + (this._promisify ? 'Promise' : 'callback') + "style API : 'query." + funcName + "'.");
        }
        this._calls.push(funcName, args);
        const gizmoText = this.constructor._getGizmoText.apply(this);
        if (this._promisify) {
          return CommonImport.Promise.promisify(this._query)(gizmoText);
        } else {
          this._query(gizmoText, callback);
        }
      };
    };

    ['All', 'GetLimit', 'ToArray', 'ToValue', 'TagArray', 'TagValue', 'ForEach', 'Map'].forEach(generator);

  }

}

module.exports = Query;


