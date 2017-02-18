'use strict';

const CommonImport = require('./CommonImport');

class Util {

  static pickRandomly() {
    if (!Array.isArray(this) || this.length === 0) {
      throw new Error('Invoker must be a nonempty array.');
    }
    if (this.length === 1) {
      return this[0];
    }
    return this[Math.floor(Math.random() * this.length)];
  }

  /*
   * For object: the key which is defined in the exclude array will also be deleted.
   * For array: the value which is put in the exclude array will also be deleted.
   */
  static cleanup(obj, exclude) {
    if (obj) {
      if (Array.isArray(obj)) {
        let i = obj.length - 1;
        while (i >= 0) {
          if (obj[i] === null
              || obj[i] === undefined
              || (typeof obj[i] === 'string' && obj[i].trim().length === 0)
              || (Array.isArray(obj[i]) && obj[i].length === 0)
              || (typeof obj[i] === 'object' && Object.keys(obj[i]).length === 0)
              || (Array.isArray(exclude) && exclude.indexOf(obj[i]) !== -1)) {
            obj.splice(i, 1);
          } else if (Array.isArray(obj[i]) || typeof obj[i] === 'object') {
            this.cleanup(obj[i]);
          } else if (typeof obj[i] === 'string') {
            obj[i] = obj[i].trim();
          }
          i--;
        }
      } else if (typeof obj === 'object') {
        let keys = Object.keys(obj);
        let i = keys.length - 1;
        while (i >= 0) {
          if (obj[keys[i]] === null
              || obj[keys[i]] === undefined
              || (typeof obj[keys[i]] === 'string' && obj[keys[i]].trim().length === 0)
              || (Array.isArray(obj[keys[i]]) && obj[keys[i]].length === 0)
              || (typeof obj[keys[i]] === 'object' && Object.keys(obj[keys[i]]).length === 0)
              || (Array.isArray(exclude) && exclude.indexOf(keys[i]) !== -1)) {
            delete obj[keys[i]];
          } else if (Array.isArray(obj[keys[i]]) || typeof obj[keys[i]] === 'object') {
            this.cleanup(obj[keys[i]]);
          } else if (typeof obj[keys[i]] === 'string') {
            obj[keys[i]] = obj[keys[i]].trim();
          }
          i--;
        }
      }
    }
  }

  static json2nquad(jsonArr) {
    if (!jsonArr || !Array.isArray(jsonArr)) {
      CommonImport.logger.error('Input should be a valid JSON array.');
      throw new Error('Input should be a valid JSON array.');
    }

    const deepCopy = JSON.parse(JSON.stringify(jsonArr));

    const normalizedNquads = [];

    const normalizeNquad = (item, primaryKey, label, isBlankNode) => {
      for (let key in item) {
        const predicate = ('<' + key + '>').replace('<<', '<').replace('>>', '>');
        if (Array.isArray(item[key])) {
          item[key].forEach((val) => {
            if (Array.isArray(val) || typeof val === 'object') {
              CommonImport.logger.error("Invalid 'Array' or 'Object' here: " + JSON.stringify(val));
              throw new Error("Invalid 'Array' or 'Object' here: " + JSON.stringify(val));
            }
            const normalizedItem = {
              subject: primaryKey,
              predicate: predicate,
              object: val
            };
            if (label) {
              normalizedItem.label = label;
            }
            normalizedNquads.push(normalizedItem);
          });
        } else if (typeof item[key] === 'object') {
          const blankNodeId = '_:BN@' + primaryKey + '.' + predicate;
          const normalizedItem = {
            subject: primaryKey,
            predicate: predicate,
            object: blankNodeId
          };
          if (label) {
            normalizedItem.label = label;
          }
          normalizedNquads.push(normalizedItem);
          normalizeNquad(item[key], primaryKey, label, blankNodeId);
        } else {
          const normalizedItem = {
            subject: primaryKey,
            predicate: predicate,
            object: '' + item[key]
          };
          if (isBlankNode) {
            normalizedItem.subject = isBlankNode;
          }
          if (label) {
            normalizedItem.label = label;
          }
          normalizedNquads.push(normalizedItem);
        }
      }
    };

    deepCopy.forEach((item) => {
      if (item.primaryKey) {

        let primaryKey = item.primaryKey;
        delete item.primaryKey;
        if (!primaryKey.startsWith('<')) {
          primaryKey = '<' + primaryKey;
        }
        if (!primaryKey.endsWith('>')) {
          primaryKey += '>';
        }

        let label = item.label;
        delete item.label;

        this.cleanup(item);
        normalizeNquad(item, primaryKey, label, false);
      }
    });

    return normalizedNquads;
  }

  static escapeRegExp(str) {
    if (!str) {
      return str;
    }
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

}

module.exports = Util;


