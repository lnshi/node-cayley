'use strict';

const path = require('path');

const {cayleyClient, assert, expect, should} = require('./initialize')(false);

const testData = require('../data/friend_circle_with_label.nq.equivalent_json');

describe('Cayley callback style HTTP APIs', function() {

  it('/v1/write & /v2/read & /v1/delete', function(done) {
    /*
     * Test API: '/v1/write'.
     */
    cayleyClient.write(testData, function(err, writeResBody) {
      if (err) {
        done(err);
      } else {
        try {
          expect(writeResBody.result).to.be.a('string');
          expect(writeResBody.result).to.include('Successfully');

          /*
           * Test API: '/v2/read'.
           */
          cayleyClient.read(function(err, readResBody) {
            if (err) {
              done(err);
            } else {
              try {
                assert.isArray(readResBody);
                assert.equal(readResBody.length, 42);

                /*
                 * Test API: '/v1/delete'.
                 *   Delete the tested inserted data.
                 */
                cayleyClient.delete(testData, function(err, deleteResBody) {
                  if (err) {
                    done(err);
                  } else {
                    try {
                      expect(deleteResBody.result).to.be.a('string');
                      expect(deleteResBody.result).to.include('Successfully');

                      /*
                       * Use '/v2/read' API to verify.
                       */
                      cayleyClient.read(function(err, readResBody) {
                        if (err) {
                          done(err);
                        } else {
                          try {
                            assert.isNull(readResBody);
                            done();
                          } catch (e) {
                            done(e);
                          }
                        }
                      });
                    } catch (e) {
                      done(e);
                    }
                  }
                });
              } catch (e) {
                done(e);
              }
            }
          });
        } catch (e) {
          done(e);
        }
      }
    });
  });

});

describe('Cayley callback style HTTP APIs', function() {

  it("'Write' with 'label', but 'delete' without providing 'label', expect deletion to be failed.", function(done) {

    /*
     * '/v1/write' data with 'label'.
     */
    cayleyClient.write([
      {
        primaryKey: '</user/shortid/23TplPLs>',
        label: 'companyA',

        userId: '23TplPLs',
        isEmailVerified: false,
        mobilePhone: {
          isVerified: false,
          alpha3CountryCode: 'SGP',
          mobilePhoneNoWithCountryCallingCode: '+6586720011'
        }
      }
    ], function(err, writeResBody) {
      if (err) {
        done(err);
      } else {
        try {
          expect(writeResBody.result).to.be.a('string');
          expect(writeResBody.result).to.include('Successfully');

          /*
           * But try to use '/v1/delete' to delete data without providing 'label', expect deletion to be failed.
           */
          cayleyClient.delete([
            {
              primaryKey: '</user/shortid/23TplPLs>',

              userId: '23TplPLs',
              isEmailVerified: false,
              mobilePhone: {
                isVerified: false,
                alpha3CountryCode: 'SGP',
                mobilePhoneNoWithCountryCallingCode: '+6586720011'
              }
            }
          ], function(err, wronglyDeleteResBody) {
            if (err) {
              done(err);
            } else {

              // After checked the MongoDB, cayley deleted nothing, but still returned: { result: 'Successfully deleted 11 quads.' }
              // So we use the '/v2/read' API to check.

              /*
               * Check with '/v2/read'.
               */
              cayleyClient.read(function(err, readResBody) {
                if (err) {
                  done(err);
                } else {
                  try {
                    assert.isArray(readResBody);
                    assert.equal(readResBody.length, 6);

                    /*
                     * Delete the inserted data correctly with '/v1/delete'.
                     */
                    cayleyClient.delete([
                      {
                        primaryKey: '</user/shortid/23TplPLs>',
                        label: 'companyA',

                        userId: '23TplPLs',
                        isEmailVerified: false,
                        mobilePhone: {
                          isVerified: false,
                          alpha3CountryCode: 'SGP',
                          mobilePhoneNoWithCountryCallingCode: '+6586720011'
                        }
                      }
                    ], function(err, correctlyDeleteResBody) {
                      if (err) {
                        done(err);
                      } else {
                        try {
                          expect(correctlyDeleteResBody.result).to.be.a('string');
                          expect(correctlyDeleteResBody.result).to.include('Successfully');

                          /*
                           * Use '/v2/read' to verify.
                           */
                          cayleyClient.read(function(err, readResBody) {
                            if (err) {
                              done(err);
                            } else {
                              try {
                                assert.isNull(readResBody);
                                done();
                              } catch (e) {
                                done(e);
                              }
                            }
                          });
                        } catch (e) {
                          done(e);
                        }
                      }
                    });
                  } catch (e) {
                    done(e);
                  }
                }
              });
            }
          });
        } catch (e) {
          done(e);
        }
      }
    });

  });

});

describe('Cayley callback style Gizmo APIs', function() {

  before(function(done) {
    cayleyClient.write(testData, (err, res) => {
      if (err) {
        return done(err);
      }
      done();
    });
  });

  after(function(done) {
    cayleyClient.delete(testData, (err, res) => {
      if (err) {
        done(err);
      } else {
        /*
         * Use '/v2/read' to verify the test cases didn't pollute the user db.
         */
        cayleyClient.read(function(err, readResBody) {
          if (err) {
            done(err);
          } else {
            if (readResBody) {
              done(new Error('Your db got polluted by this test, please report this issue!!!'));
            } else {
              done();
            }
          }
        });
      }
    });
  });

  it("'promisify' was set to false, but no 'callback' provided.", function() {
    assert.throws(function() {
      cayleyClient.g.type('query').V().All();
    }, Error);
  });

  it("Invalid type for Gizmo, valid types are: 'query' or 'shape'.", function() {
    assert.throws(function() {
      cayleyClient.g.type('lalala').V().All();
    });
  });

  it('graph.Vertex(nodeId)', function(done) {
    cayleyClient.g.V('</user/shortid/23TplPdS>').All(function(err, res) {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('graph.Vertex([nodeId, ...])', function(done) {
    cayleyClient.g.type('shape').V(['</user/shortid/23TplPdS>', '</user/shortid/46Juzcyx>']).All(function(err, res) {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('graph.Morphism()', function(done) {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Out(predicatePath, tag)', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>', 'predicate').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.Out(predicatePath, [tag, ...])', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>', ['predicate', 'ifExtraTag?']).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.Out([predicatePath, ...], [tag, ...])', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Out(['<follows>', '<userId>'], ['predicate', 'extraTag']).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.Out([predicatePath, ...], tag)', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Out(
      cayleyClient.g.V(['<userId>', '<userSetId>']), 'predicate'
    ).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.Out([predicatePath, ...], [tag, ...])', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Out(
      cayleyClient.g.V(['<userId>', '<userSetId>']), ['predicate', 'extraTag']
    ).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.In(predicatePath, tag)', function(done) {
    cayleyClient.g.V('false').In('<isEmailVerified>', 'predicate').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.In(predicatePath, [tag, ...])', function(done) {
    cayleyClient.g.V('false').In('<isEmailVerified>', ['predicate', 'ifExtraTag?']).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.In([predicatePath, ...], [tag, ...])', function(done) {
    cayleyClient.g.V('false').In(['<isEmailVerified>', '<isVerified>'], ['predicate', 'extraTag']).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.In([predicatePath, ...], tag)', function(done) {
    cayleyClient.g.V('false').In(
      cayleyClient.g.V(['<isEmailVerified>', '<isVerified>']), 'predicate'
    ).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.In([predicatePath, ...], [tag, ...])', function(done) {
    cayleyClient.g.V('false').In(
      cayleyClient.g.V(['<isEmailVerified>', '<isVerified>']), ['predicate', 'extraTag']
    ).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      } 
    });
  });

  it('path.Both([predicatePath], [tags])', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Both('<follows>', 'predicate').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Is(node)', function(done) {
    cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Is('</user/shortid/46Juzcyx>').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Is([node, ...])', function(done) {
    cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>')
      .Is(['</user/shortid/46Juzcyx>', '</user/shortid/hwX6aOr7>', '</user/fake/value>']).All((err, res) => {
        if (err) {
          done(err);
        } else {
          try {
            assert.isArray(res.result);
            done();
          } catch (e) {
            done(e);
          }
      }
    });
  });

  it('path.Is(node), and not match', function(done) {
    cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Is('</user/fake/value>').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isNull(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Is(node), pass in nothing', function(done) {
    cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Is().All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Has(predicatePath, node)', function(done) {
    cayleyClient.g.V().Has('<gender>', 'F').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.LabelContext(), pass in nothing', function(done) {
    cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').LabelContext().In('<follows>').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.LabelContext(labelPath, tag)', function(done) {
    cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').LabelContext('companyA', 'label').In('<follows>').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.LabelContext(labelPath, [tag, ...])', function(done) {
    cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').LabelContext('companyA', ['label', 'extraTag']).In('<follows>').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.LabelContext([labelPath, ...], [tag, ...])', function(done) {
    cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').LabelContext(['companyB', 'companyB'], ['label', 'extraTag'])
      .In('<follows>').All((err, res) => {
        if (err) {
          done(err);
        } else {
          try {
            assert.isNull(res.result);
            done();
          } catch (e) {
            done(e);
          }
        }
    });
  });

  it('path.Limit(limit)', function(done) {
    cayleyClient.g.V('M').In('<gender>').Limit(1).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          assert.equal(res.result.length, 1);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Limit(), missing required parameter, expect error', function(done) {
    cayleyClient.g.V('M').In('<gender>').Limit().All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isNotNull(res.error);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Skip(offset), skip 0', function(done) {
    cayleyClient.g.V().Has('<alpha3CountryCode>', 'SGP').Skip(0).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          assert.equal(res.result.length, 3);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Skip(offset), skip 2', function(done) {
    cayleyClient.g.V().Has('<alpha3CountryCode>', 'SGP').Skip(2).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          assert.equal(res.result.length, 1);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Skip(), missing required parameter, expect error', function(done) {
    cayleyClient.g.V().Has('<alpha3CountryCode>', 'SGP').Skip().All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isNotNull(res.error);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.InPredicates()', function(done) {
    cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').InPredicates().All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.InPredicates()', function(done) {
    cayleyClient.g.V('true').InPredicates().All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.OutPredicates()', function(done) {
    cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').OutPredicates().All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Tag(tag)', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Tag('step_0').Out('<follows>').Tag('step_1').In('<follows>').Tag('step_2').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Tag([tag, ...])', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Tag(['step_0', 'extraTag']).Out('<follows>').Tag('step_1')
      .In('<follows>').Tag('step_2').All((err, res) => {
        if (err) {
          done(err);
        } else {
          try {
            assert.isArray(res.result);
            done();
          } catch (e) {
            done(e);
          }
        }
    });
  });

  it('path.As([tag, ...])', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Tag(['step_0', 'extraTag']).Out('<follows>').Tag('step_1')
      .In('<follows>').Tag('step_2').All((err, res) => {
        if (err) {
          done(err);
        } else {
          try {
            assert.isArray(res.result);
            done();
          } catch (e) {
            done(e);
          }
        }
    });
  });

  it('path.Back(tag), access intermediate results', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>').Tag('myFollowees')
      .In('<follows>').Has('<gender>', 'F').Back('myFollowees').All((err, res) => {
        if (err) {
          done(err);
        } else {
          try {
            assert.isArray(res.result);
            done();
          } catch (e) {
            done(e);
          }
        }
      });
  });

  it('path.Back(tag), take another route', function(done) {
    cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>').Tag('myFollowees')
      .In('<follows>').Has('<gender>', 'F').Back('myFollowees').Out('<mobilePhone>').Tag('mobilePhone').All((err, res) => {
        if (err) {
          done(err);
        } else {
          try {
            assert.isArray(res.result);
            done();
          } catch (e) {
            done(e);
          }
        }
      });
  });

  it('path.Save(predicate, tag)', function(done) {
    cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').Save('<follows>', 'target').All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Intersect(query)', function(done) {
    const queryA = cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>');
    const queryB = cayleyClient.g.V('</user/shortid/hwX6aOr7>').Out('<follows>');
    queryA.Intersect(queryB).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.And(query)', function(done) {
    const queryA = cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>');
    const queryB = cayleyClient.g.V('</user/shortid/hwX6aOr7>').Out('<follows>');
    queryA.Intersect(queryB).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Union(query)', function(done) {
    const queryA = cayleyClient.g.V().Tag('user').In('<follows>').Has('<gender>', 'F').Back('user');
    const queryB = cayleyClient.g.V().Tag('user').Out('<mobilePhone>').Out('<isVerified>').Tag('mobileNoVerified').Is('true');
    queryA.Union(queryB).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Or(query)', function(done) {
    const queryA = cayleyClient.g.V().Tag('user').In('<follows>').Has('<gender>', 'F').Back('user');
    const queryB = cayleyClient.g.V().Tag('user').Out('<mobilePhone>').Out('<isVerified>').Tag('mobileNoVerified').Is('true');
    queryA.Or(queryB).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Except(query)', function(done) {
    const queryA = cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>');
    const queryB = cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Has('<gender>', 'M');
    queryA.Except(queryB).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.Difference(query)', function(done) {
    const queryA = cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>');
    const queryB = cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Has('<gender>', 'M');
    queryA.Difference(queryB).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

  it('path.FollowR(morphism)', function(done) {
    const willBeReversedQuery = cayleyClient.g.M().Out('<follows>');
    cayleyClient.g.V('</user/shortid/23TplPdS>').FollowR(willBeReversedQuery).All((err, res) => {
      if (err) {
        done(err);
      } else {
        try {
          assert.isArray(res.result);
          done();
        } catch (e) {
          done(e);
        }
      }
    });
  });

});


