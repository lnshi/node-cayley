'use strict';

const chai = require('chai');
const {assert, expect} = chai;
const should = chai.should();

const cayley = require('../../');

const defaultHost = 'localhost';
const defaultPort = 64210;
const defaultUri = defaultHost + ':' + defaultPort;

describe('Cayley client(Pool) initialization', function() {

  const _assertCayleyClient = (cayleyClient) => {
    assert.isObject(cayleyClient);
    assert.isObject(cayleyClient.graph);
    assert.isObject(cayleyClient.g);
    assert.isFunction(cayleyClient.write);
    assert.isFunction(cayleyClient.writeFile);
    assert.isFunction(cayleyClient.delete);
  };

  it('Empty cayley configuration.', function() {
    assert.throws(function() {
      cayley();
    }, Error);
  });

  it("'secure' was set to true but necessary certificates not provided.", function() {
    assert.throws(function() {
      cayley(defaultUri, {
        secure: true
      }, Error);
    });
  });

  it("If single cayley server is provided, this lib will return 'cayleyClient' object directly.", function() {
    const cayleyClient = cayley(defaultUri);
    assert.isObject(cayleyClient);
  });

  it("If multiple cayley servers are provided, this lib will return a cayley client pool which is an Array of cayley clients, and also will provide a default random client selection strategy which is with form 'pickRandomly(candidatesArr)'.", function() {
    const cayleyClientPool = cayley({
      promisify: true,
      secure: false,
      servers: [
        {
          host: 'localhost',
          port: 65534,
          secure: false
        }, {
          host: 'localhost',
          port: 65533
        }
      ]
    });
    assert.isArray(cayleyClientPool);
    assert.isFunction(cayleyClientPool.pickRandomly);
  });

  it("Valid configuration example 0: only provide the 'uri'.", function() {
    const cayleyClient = cayley(defaultUri);
    _assertCayleyClient(cayleyClient);
  });

  it("Valid configuration example 1: only provide the 'opts' object.", function() {
    const cayleyClient = cayley({
      logLevel: 5,
      promisify: true,
      servers: [
        {
          host: defaultHost,
          port: defaultPort,
          /*
           * Options put here will be applied to this specific server and will override the top level options.
           *   - certFile
           *   - keyFile
           *   - caFile
           */
          secure: false
        }
      ]
    });
    _assertCayleyClient(cayleyClient);
  });

  it("Valid configuration example 2: mix 'uri' and 'opts'.", function() {
    const cayleyClient = cayley(defaultUri, {
      logLevel: 5,
      promisify: true
    });
    _assertCayleyClient(cayleyClient);
  });

  it("Valid configuration example 2: mix 'uri' and 'opts'.", function() {
    const cayleyClient = cayley(defaultUri, {
      logLevel: 5,
      promisify: true,
      // The uri(defaultUri) will be merged into the below 'servers' with the top level options.
      servers: [
        {
          host: defaultHost,
          port: defaultPort,
          /*
           * Options put here will be applied to this specific server and will override the top level options.
           *   - certFile
           *   - keyFile
           *   - caFile
           */
          secure: false
        }
      ]
    });
    _assertCayleyClient(cayleyClient);
  });

});

module.exports = (promisify) => {

  return {

    cayleyClient: cayley({
      logLevel: 5,
      promisify: promisify,
      servers: [
        {
          host: defaultHost,
          port: defaultPort,
          /*
           * Options put here will be applied to this specific server and will override the top level options.
           *   - certFile
           *   - keyFile
           *   - caFile
           */
          secure: false
        }
      ]
    }),

    assert: assert,
    expect: expect,
    should: should

  };

};


