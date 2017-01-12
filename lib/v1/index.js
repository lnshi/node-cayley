'use strict';

const CommonImport = require('../util/CommonImport');

const utils = require('../util/Util');

module.exports = {

  graph: {
    alias: 'g',
    factory: (promisify ,requestWithDefaultOpts) => {
      return new (require('./gremlin/Gremlin'))(promisify, requestWithDefaultOpts);
    }
  },

  write: function(data, callback) {
    this.post({
      uri: '/write',
      json: true,
      body: utils.json2nquad(data)
    }, (err, res, resBody) => {
      callback && callback(err, resBody);
    });
  },

  writeFile: function(file, callback) {
    const req = this.post({
      json: true,
      uri: '/write/file/nquad'
    }, (err, res, resBody) => {
      callback && callback(err, resBody);
    });
    req.form().append('NQuadFile', CommonImport.fs.createReadStream(file));
  },

  delete: function(data, callback) {
    this.post({
      uri: '/delete',
      json: true,
      body: utils.json2nquad(data)
    }, (err, res, resBody) => {
      callback && callback(err, resBody);
    });
  }

};


