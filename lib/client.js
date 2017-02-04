'use strict';

const CommonImport = require('./util/CommonImport');

const request = require('request');

module.exports = (_opts) => {

  const clients = [];

  _opts.servers.forEach((server) => {

    const defaultOpts = {
      baseUrl: server.baseUrl + '/api',
      headers: {}
    };

    if (server.secure) {
      Object.assign(defaultOpts, {
        cert: CommonImport.fs.readFileSync(server.certFile || _opts.certFile),
        key: CommonImport.fs.readFileSync(server.keyFile || _opts.keyFile),
        ca: CommonImport.fs.readFileSync(server.caFile || _opts.caFile)
      });
    }

    const requestWithDefaultOpts = request.defaults(defaultOpts);

    const api = require('./api');

    const instance = {};

    for (let key in api) {
      let fx = api[key];
      if (typeof fx === 'function') {
        if (_opts.promisify) {
          instance[key] = CommonImport.Promise.promisify(fx.bind(requestWithDefaultOpts))
        } else {
          instance[key] = fx.bind(requestWithDefaultOpts);
        }
      } else if (typeof fx === 'object' && fx.factory) {
        instance[key] = fx.factory(_opts.promisify, requestWithDefaultOpts, (server.queryLang || _opts.queryLang));
        if (fx.alias) {
          instance[fx.alias] = instance[key];
        }
      }
    }

    clients.push(instance);

  });

  return clients;

};


