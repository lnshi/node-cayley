'use strict';

const chai = require('chai');
const {assert, expect} = chai;
const should = chai.should();

const cayley = require('../../');

const defaultHost = 'localhost';
const defaultPort = 64210;
const defaultUri = defaultHost + ':' + defaultPort;

describe('Cayley initialization', function() {

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

  it("Only provide the 'uri' is also valid configuration.", function() {
    const cayleyInstancePool = cayley(defaultUri);
    assert.isFunction(cayleyInstancePool.pickRandomly);
    assert.isArray(cayleyInstancePool);
    cayleyInstancePool.forEach(function(cayleyInstance) {
      assert.isObject(cayleyInstance.graph);
      assert.isObject(cayleyInstance.g);
      assert.isFunction(cayleyInstance.write);
      assert.isFunction(cayleyInstance.writeFile);
      assert.isFunction(cayleyInstance.delete);
    });
  });

});

module.exports = (promisify) => {

  return {

    cayleyInstancePools: [

      cayley(defaultUri, {
        logLevel: 5,
        promisify: promisify
      }),

      cayley(defaultUri, {
        logLevel: 5,
        promisify: promisify,
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
      }),

      cayley({
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
      })

    ],

    assert: assert,
    expect: expect,
    should: should

  };

};


