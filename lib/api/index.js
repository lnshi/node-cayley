'use strict';

const CommonImport = require('../util/CommonImport');

const utils = require('../util/Util');

module.exports = {

  graph: {
    alias: 'g',
    factory: (promisify ,requestWithDefaultOpts) => {
      return new (require('./gizmo/Gizmo'))(promisify, requestWithDefaultOpts);
    }
  },

  read: function(callback) {
    this.post({
      uri: '/v2/read',
      json: true
    }, (err, res, resBody) => {
      callback && callback(err, resBody);
    });
  },

  write: function(data, callback) {
    this.post({
      uri: '/v2/write',
      json: true,
      body: utils.json2nquad(data)
    }, (err, res, resBody) => {
      callback && callback(err, resBody);
    });
  },

  writeFile: function(file, callback) {
    const req = this.post({
      json: true,
      uri: '/v1/write/file/nquad'
    }, (err, res, resBody) => {
      callback && callback(err, resBody);
    });
    req.form().append('NQuadFile', CommonImport.fs.createReadStream(file));
  },

  delete: function(data, callback) {
    this.post({
      uri: '/v2/delete',
      json: true,
      body: utils.json2nquad(data)
    }, (err, res, resBody) => {
      callback && callback(err, resBody);
    });
  }

};


