'use strict';

const CommonImport = require('../util/CommonImport');

const utils = require('../util/Util');

const _callback = (err, data, callback) => {
  if (err) {
    callback && callback(err);
  } else {
    let dataInJSON;
    try {
      dataInJSON = JSON.parse(data);
    } catch (e) {
      return callback && callback(e);
    }
    callback && callback(null, dataInJSON);
  }
};

module.exports = {

  graph: {
    alias: 'g',
    factory: (promisify ,requestWithDefaultOpts, queryLang) => {
      return new (require('./gizmo/Gizmo'))(promisify, requestWithDefaultOpts, queryLang);
    }
  },

  write: function(data, callback) {
    this.post({
      uri: '/write',
      json: true,
      body: utils.json2nquad(data)
    }, (err, res, resBody) => {
      _callback(err, resBody, callback);
    });
  },

  writeFile: function(file, callback) {
    const req = this.post({
      json: true,
      uri: '/write/file/nquad'
    }, (err, res, resBody) => {
      _callback(err, resBody, callback);
    });
    req.form().append('NQuadFile', CommonImport.fs.createReadStream(file));
  },

  delete: function(data, callback) {
    this.post({
      uri: '/delete',
      json: true,
      body: utils.json2nquad(data)
    }, (err, res, resBody) => {
      _callback(err, resBody, callback);
    });
  }

};


