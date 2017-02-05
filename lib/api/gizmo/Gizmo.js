'use strict';

const CommonImport = require('../../util/CommonImport');

const types = ['query', 'shape'];

const Path = require('./Path');
const Query = require('./Query');

class Gizmo {

  constructor(promisify, requestWithDefaultOpts, type) {
    this._promisify = promisify;
    this._request = requestWithDefaultOpts;

    this._type = type || types[0];
  }

  type(type) {
    if (!type || types.indexOf(type) === -1) {
      throw new Error("Please pass in a valid type, can be: 'query' or 'shape'.");
    }
    const gizmo = new this.constructor(this._promisify, this._request, this._type);
    gizmo._query = gizmo._query.bind(gizmo);
    return gizmo;
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
    return path;
  }

  _v() {
    const query = new Query(['V', arguments[0]], this._promisify);
    query._query = this._query;
    query._request = this._request;
    query._type = this._type;
    return query;
  }

  _query(gizmoText, callback) {
    this._request.post({
      uri: '/v1/' + this._type + '/gizmo',
      body: gizmoText
    }, (err, res, resBody) => {
      if (err) {
        callback(err);
      } else {
        let resBodyInJSON;
        try {
          resBodyInJSON = JSON.parse(resBody);
        } catch (e) {
          return callback(e);
        }
        callback(null, resBodyInJSON);
      }
    });
  }

}

module.exports = Gizmo;


