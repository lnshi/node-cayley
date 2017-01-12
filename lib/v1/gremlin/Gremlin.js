'use strict';

const CommonImport = require('../../util/CommonImport');

const types = ['query', 'shape'];

const Path = require('./Path');
const Query = require('./Query');

class Gremlin {

  constructor(promisify, requestWithDefaultOpts) {
    this._promisify = promisify;
    this._request = requestWithDefaultOpts;
  }

  type(type) {
    if (!type || types.indexOf(type) === -1) {
      throw new Error("Please pass in valid type, can be: 'query' or 'shape'.");
    }
    const gremlin = new this.constructor(this._promisify, this._request);
    gremlin._query = gremlin._query.bind(gremlin, type);
    return gremlin;
  }

  V() {
    return this._v(Array.prototype.slice.call(arguments));
  }

  Vertex() {
    return this._v(Array.prototype.slice.call(arguments));
  }

  M() {
    return this.Morphism();
  }

  Morphism() {
    const path = new Path(['M', []]);
    path._query = this._query;
    return path;
  }

  _v() {
    const query = new Query(['V', arguments[0]], this._promisify);
    query._query = this._query;
    return query;
  }

  _query(type, gremlinText, callback) {
    if (types.indexOf(type) === -1) {
      type = types[0];
    }
    this._request.post({
      uri: '/' + type + '/gremlin',
      body: gremlinText
    }, (err, res, resBody) => {
      if (err) {
        callback(err);
      } else {
        callback(null, JSON.parse(resBody));
      }
    });
  }

}

module.exports = Gremlin;


