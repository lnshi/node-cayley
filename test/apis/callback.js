'use strict';

const path = require('path');

const {cayleyInstancePools, assert, expect, should} = require('./initialize')(false);

const pickRandomly = cayleyInstancePools[0].pickRandomly;

describe('Cayley callback style HTTP APIs', function() {

  it('/write', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).write([
      {
        primaryKey: '</user/shortid/23TplPdS>',
        label: 'companyA',

        userId: '23TplPdS',
        userSetId: 'XXX_L2',
        realName: 'XXX_L3',
        displayName: 'XXX_L4',
        gender: 'M',
        email: 'xxx.l6@xxx.com',
        isEmailVerified: false,
        mobilePhone: {
          isVerified: false,
          alpha3CountryCode: '+65',
          mobilePhoneNoWithCountryCallingCode: '+6586720011'
        }
      }
    ], function(err, resBody) {
      if (err) {
        done(err);
      } else {
        try {
          expect(resBody.result).to.be.a('string');
          expect(resBody.result).to.include('Successfully');
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('/write/file/nquad', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).writeFile(
      path.resolve(__dirname, '../data/friend_circle_with_label.nq'),
      function(err, resBody) {
        if (err) {
          done(err);
        } else {
          try {
            expect(resBody.result).to.be.a('string');
            expect(resBody.result).to.include('Successfully');
            done();
          } catch (e) {
            done(e);
          }
        }
      }
    );
  });

  // https://github.com/cayleygraph/cayley/issues/517
  it('/delete', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).delete([
      {
        primaryKey: '</user/shortid/23TplPdS>',
        label: 'companyA',

        userId: '23TplPdS',
        userSetId: 'XXX_L2',
        realName: 'XXX_L3',
        displayName: 'XXX_L4',
        gender: 'M',
        email: 'xxx.l6@xxx.com',
        isEmailVerified: false,
        mobilePhone: {
          isVerified: false,
          alpha3CountryCode: '+65',
          mobilePhoneNoWithCountryCallingCode: '+6586720011'
        }
      }
    ], function(err, resBody) {
      if (err) {
        done(err);
      } else {
        try {
          expect(resBody.result).to.be.a('string');
          expect(resBody.result).to.include('Successfully');
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

});

describe('Cayley callback style Gremlin APIs', function() {

  it("'promisify' was set to false, but no 'callback' provided.", function() {
    assert.throws(function() {
      pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query').V().All();
    }, Error);
  });

  it("Invalid type for Gremlin, valid types are: 'query' or 'shape'.", function() {
    assert.throws(function() {
      pickRandomly(pickRandomly(cayleyInstancePools)).g.type('lalala').V().All();
    });
  });

  it('query.All(callback)', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query').V().All(function(err, resBody) {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(resBody.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('query.GetLimit(size, callback)', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query').V().GetLimit(1, function(err, resBody) {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(resBody.result);
          expect(resBody.result).to.have.length.most(1);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('query.ToArray(callback)', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query').V().ToArray(function(err, resBody) {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(resBody.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('query.ToValue(callback)', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query').V().ToValue(function(err, resBody) {
      if (err) {
        done(err);
      } else {
        try {
          assert.isString(resBody.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('query.TagArray(callback)', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
      .V("</user/shortid/23TplPdS>").Tag("userId").In("<follows>").TagArray(function(err, resBody) {
        if (err) {
          done(err);
        } else {
          try {
            assert.isArray(resBody.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
            done();
          } catch (e) {
            done(e);
          }
        }
      });
  });

  it('query.TagValue(callback)', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
      .V("</user/shortid/23TplPdS>").Tag("userId").In("<follows>").TagValue(function(err, resBody) {
        if (err) {
          done(err);
        } else {
          try {
            assert.isString(resBody.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
            done();
          } catch (e) {
            done(e);
          }
        }
      });
  });

  /*
   * Watch: try to understand the design here, the 'gremlinCallback' should satisfy the following conditions:
   *   1. No any reference to anything outside of this function, only pure js code.
   *     - Coz this function will be stringified and committed to cayley server, and then get executed there.
   *     - ES6 'arrow function' and other advanced features whether can be supported haven't been tested.
   *   2. Can use the APIs exposed by this lib belong to 'Path' object.
   */
  it("Missed 'gremlinCallback' function in 'query.ForEach(gremlinCallback, callback)'", function() {
    assert.throws(function() {
      pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
        .V("</user/shortid/23TplPdS>").In().ForEach(function(err, resBody) {});
    });
  });

  it('query.ForEach(gremlinCallback, callback)', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
      .V("</user/shortid/23TplPdS>").In().ForEach(function(data) {
        g.Emit(data);
      }, function(err, resBody) {
        if (err) {
          done(err);
        } else {
          try {
            assert.isArray(resBody.result);
            done();
          } catch (e) {
            done(e);
          }
        }
      });
  });

  it("Missed 'gremlinCallback' function in 'query.ForEach(limit, gremlinCallback, callback)'", function() {
    assert.throws(function() {
      pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
        .V("</user/shortid/23TplPdS>").In().ForEach(1, function(err, resBody) {});
    });
  });

  it('query.ForEach(limit, gremlinCallback, callback)', function(done) {
    pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
      .V("</user/shortid/23TplPdS>").In().ForEach(1, function(data) {
        g.Emit(data);
      }, function(err, resBody) {
        if (err) {
          done(err);
        } else {
          try {
            assert.isArray(resBody.result);
            expect(resBody.result).to.have.length.most(1, 'https://github.com/cayleygraph/cayley/issues/518');
            done();
          } catch (e) {
            done(e);
          }
        }
      });
  });

});

