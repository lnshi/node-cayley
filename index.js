'use strict';

const CommonImport = require('./lib/util/CommonImport');

const apiVersions = ['v1', 'v2', 'v3', 'v4', 'v5'];

const queryLangs = ['gizmo', 'gremlin'];

module.exports = (uri, opts) => {

  /*
   * Try to set log level.
   */
  let logLevel = 5;
  if (uri && uri.logLevel !== undefined && uri.logLevel !== null && +uri.logLevel >= 0) {
    logLevel = +uri.logLevel;
  } else if (opts && opts.logLevel !== undefined && opts.logLevel !== null && +opts.logLevel >= 0) {
    logLevel = +opts.logLevel;
  }
  CommonImport.logger.configure({
    level: logLevel
  });

  if (!uri) {
    CommonImport.logger.error('Invalid cayley configurations.');
    throw new Error('Invalid cayley configurations.');
  }

  switch (typeof uri) {
    case 'string':
      uri = uri.replace(/.*\/{2,}|\/+.*$/g, '');
      break;
    case 'object':
      CommonImport.logger.warn("'uri' is provided with JSON object, 2nd parameter 'opts' will be ignored.");
      opts = uri;
      uri = undefined;
      break;
    default:
      CommonImport.logger.error('Invalid cayley configurations.');
      throw new Error('Invalid cayley configurations.');
  }

  /*
   * Default values for opts.
   * Options defined for specific cayley instance will override outside options.
   */
  const _opts = {
    apiVersion: 'v1',
    queryLang: 'gremlin',
    promisify: false,
    secure: false,
    servers: []
  };

  if (opts) {
    if (typeof opts === 'object') {

      _opts.apiVersion = apiVersions.indexOf(opts.apiVersion) !== -1 ? opts.apiVersion : _opts.apiVersion;
      _opts.queryLang = queryLangs.indexOf(opts.queryLang) !== -1 ? opts.queryLang : _opts.queryLang;

      _opts.promisify = !!opts.promisify;

      if (!!opts.secure) {
        if (!opts.certFile || !opts.keyFile || !opts.caFile) {
          CommonImport.logger.error("'secure' is set to 'true', 'certFile', 'keyFile' or 'caFile' is missing.");
          throw new Error("'secure' is set to 'true', 'certFile', 'keyFile' or 'caFile' is missing.");
        }
        Object.assign(_opts, {
          secure: true,
          certFile: opts.certFile,
          keyFile: opts.keyFile,
          caFile: opts.caFile
        });
      } else {
        _opts.secure = false;
      }

      if (!!uri) {
        CommonImport.logger.warn("Both 'uri' and 'opts' provided, 'uri' will be merged into 'opts.servers' with top level options.");
        _opts.servers.push({
          secure: _opts.secure,
          baseUrl: (_opts.secure ? 'https://' : 'http://') + uri
        });
      }

      if (opts.servers) {
        if (Array.isArray(opts.servers)) {
          opts.servers.forEach((item) => {
            if (item.host && item.port) {
              const secure = (item.secure === undefined || item.secure === null || typeof item.secure !== 'boolean') ? _opts.secure : item.secure;
              const baseUrl = (secure ? 'https://' : 'http://') + item.host + ':' + item.port;
              if (_opts.servers.every((server) => {
                return server.baseUrl !== baseUrl;
              })) {
                const tmp = {
                  secure: secure,
                  baseUrl: baseUrl
                };
                if (apiVersions.indexOf(item.apiVersion) !== -1) {
                  tmp.apiVersion = item.apiVersion;
                } else {
                  if (item.apiVersion) {
                    throw new Error("Invalid 'apiVersion', valid values are: 'v1'.");
                  }
                  delete item.apiVersion;
                }
                if (queryLangs.indexOf(item.queryLang) !== -1) {
                  tmp.queryLang = item.queryLang;
                } else {
                  if (item.queryLang) {
                    throw new Error("Invalid 'queryLang', valid values are: 'gizmo' or 'gremlin' depends on the version of Cayley server you are using.");
                  }
                  delete item.queryLang;
                }
                if (secure && item.certFile && item.keyFile && item.caFile) {
                  Object.assign(tmp, {
                    certFile: item.certFile,
                    keyFile: item.keyFile,
                    caFile: item.caFile
                  });
                }
                _opts.servers.push(tmp);
              }
            }
          });
        } else {
          CommonImport.logger.error("'opts.servers' should be provided with an array.");
          throw new Error("'opts.servers' should be provided with an array.");
        }
      }

    } else {
      CommonImport.logger.error('Options should be provided with a JSON object.');
      throw new Error('Options should be provided with a JSON object.');
    }
  } else {
    _opts.servers = [
      {
        baseUrl: 'http://' + uri,
        secure: false
      }
    ];
  }

  const cayleyInstancePool = require('./lib/client')(_opts);

  if (cayleyInstancePool.length === 1) {
    return cayleyInstancePool[0];
  }

  cayleyInstancePool.pickRandomly = require('./lib/util/Util').pickRandomly;

  return cayleyInstancePool;

};


