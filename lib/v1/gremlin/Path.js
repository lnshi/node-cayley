'use strict';

const CommonImport = require('../../util/CommonImport');

class Path {

  constructor(calls) {
    this._calls = calls;
    this.constructor._generateFuncs4Path.apply(this);
  }

  static _generateFuncs4Path() {

    const generator = (funcName) => {
      this[funcName] = (...args) => {
        this._calls.push(funcName, args);
        return this;
      };
    };

    // Basic Traversals
    ['Out', 'In', 'Both', 'Is', 'Has', 'LabelContext', 'Limit', 'Skip', 'InPredicates', 'OutPredicates'].forEach(generator);

    // Tagging
    ['Tag', 'As', 'Back', 'Save'].forEach(generator);

    //Joining
    ['Intersect', 'And', 'Union', 'Or', 'Except', 'Difference'].forEach(generator);

    //Using Morphisms
    ['Follow', 'FollowR'].forEach(generator);
  }

}

module.exports = Path;


