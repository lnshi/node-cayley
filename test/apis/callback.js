'use strict';

const path = require('path');

const {cayleyClient, assert, expect, should} = require('./initialize')(false);

describe('Cayley callback style HTTP APIs', function() {

  it('/v2/write & /v2/read & /v2/delete', function(done) {
    /*
     * Test API: /v2/write
     */
    cayleyClient.write([
      {
        primaryKey: '</user/shortid/23TplPLs>',
        label: 'companyA',

        userId: '23TplPLs',
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
    ], function(err, writeResBody) {
      if (err) {
        done(err);
      } else {
        try {
          expect(writeResBody.result).to.be.a('string');
          expect(writeResBody.result).to.include('Successfully');

          /*
           * Test API: /v2/read
           */
          cayleyClient.read(function(err, readResBody) {
            if (err) {
              done(err);
            } else {
              try {
                assert.isArray(readResBody);
                assert.notEqual(readResBody.length, 0);

                /*
                 * Test API: /v2/delete
                 * Delete the tested inserted data.
                 */
                cayleyClient.delete([
                  {
                    primaryKey: '</user/shortid/23TplPLs>',
                    label: 'companyA',

                    userId: '23TplPLs',
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
                ], function(err, deleteResBody) {
                  if (err) {
                    done(err);
                  } else {
                    try {
                      expect(deleteResBody.result).to.be.a('string');
                      expect(deleteResBody.result).to.include('Successfully');
                      expect(deleteResBody.count).to.equal(writeResBody.count);
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
  });

});

describe('Cayley callback style HTTP APIs', function() {

  it("'Write' with 'label', but 'delete' without providing 'label', expect deletion to be failed.", function(done) {

    /*
     * Write data with 'label'.
     */
    cayleyClient.write([
      {
        primaryKey: '</user/shortid/23TplPLs>',
        label: 'companyA',

        userId: '23TplPLs',
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
    ], function(err, writeResBody) {
      if (err) {
        done(err);
      } else {
        try {
          expect(writeResBody.result).to.be.a('string');
          expect(writeResBody.result).to.include('Successfully');

          /*
           * But try to delete data without providing 'label', expect deletion to be failed.
           */
          cayleyClient.delete([
            {
              primaryKey: '</user/shortid/23TplPLs>',

              userId: '23TplPLs',
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
          ], function(err, wronglyDeleteResBody) {
            if (err) {
              done(err);
            } else {
              expect(wronglyDeleteResBody).to.have.property('error');
              expect(wronglyDeleteResBody.error).to.be.a('string');
              expect(wronglyDeleteResBody.error).to.include('not exist');

              /*
               * Delete the inserted data correctly.
               */
              cayleyClient.delete([
                {
                  primaryKey: '</user/shortid/23TplPLs>',
                  label: 'companyA',

                  userId: '23TplPLs',
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
              ], function(err, correctlyDeleteResBody) {
                if (err) {
                  done(err);
                } else {
                  try {
                    expect(correctlyDeleteResBody.result).to.be.a('string');
                    expect(correctlyDeleteResBody.result).to.include('Successfully');
                    expect(correctlyDeleteResBody.count).to.equal(writeResBody.count);
                    done();
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

describe('Cayley callback style HTTP APIs', function() {

  it('/v1/write/file/nquad', function(done) {
    cayleyClient.writeFile(
      path.resolve(__dirname, '../data/test_purpose.nq'),
      function(err, res) {
        if (err) {
          done(err);
        } else {
          try {
            expect(res.result).to.be.a('string');
            expect(res.result).to.include('Successfully');

            /*
             * Delete the inserted data correctly.
             */
            cayleyClient.delete([
              {
                primaryKey: '</user/shortid/23TplPLs>',
                label: 'companyA',

                userId: '23TplPLs',
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
            ], function(err, deleteResBody) {
              if (err) {
                done(err);
              } else {
                try {
                  expect(deleteResBody.result).to.be.a('string');
                  expect(deleteResBody.result).to.include('Successfully');
                  expect(res.result).to.include(deleteResBody.count);
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
      }
    );
  });

});

describe('Cayley callback style Gizmo APIs', function() {

  before(function(done) {
    cayleyClient.writeFile(path.resolve(__dirname, '../data/friend_circle_with_label.nq'), (err, res) => {
      if (err) {
        return done(err);
      }
      done();
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
    cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').LabelContext(['companyB', 'companyB'], ['label', 'extraTag']).In('<follows>').All((err, res) => {
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

  // it('query.GetLimit(size, callback)', function(done) {
  //   cayleyClient.g.type('query').V().GetLimit(1, function(err, res) {
  //     if (err) {
  //       done(err);
  //     } else {
  //       try {
  //         assert.isArray(res.result);
  //         expect(res.result).to.have.length.most(1);
  //         done();
  //       } catch (e) {
  //         done(e);
  //       }
  //     }
  //   });
  // });

  // it('query.ToArray(callback)', function(done) {
  //   cayleyClient.g.type('query').V("</user/shortid/23TplPLs>").Tag("userId").In("<follows>").ToArray(function(data) {
  //     for (var idx in data) {
  //       g.Emit(data[idx]);
  //     }
  //   }, function(err, res) {
  //     if (err) {
  //       done(err);
  //     } else {
  //       try {
  //         assert.isArray(res.result);
  //         done();
  //       } catch (e) {
  //         done(e);
  //       }
  //     }
  //   });
  // });

  // it('query.ToValue(callback)', function(done) {
  //   cayleyClient.g.type('query').V("</user/shortid/23TplPLs>").Tag("userId").In("<follows>").ToValue(function(data) {
  //     g.Emit(data);
  //   }, function(err, res) {
  //     console.log(res.result);
  //     if (err) {
  //       done(err);
  //     } else {
  //       try {
  //         assert.isString(res.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
  //         done();
  //       } catch (e) {
  //         done(e);
  //       }
  //     }
  //   });
  // });

  // it('query.TagArray(callback)', function(done) {
  //   cayleyClient.g.type('query').V("</user/shortid/23TplPLs>").Tag("userId").In("<follows>").TagArray(function(data) {
  //     for (var idx in data) {
  //       g.Emit(data[idx]);
  //     }
  //   }, function(err, res) {
  //     console.log(res);
  //     if (err) {
  //       done(err);
  //     } else {
  //       try {
  //         assert.isArray(res.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
  //         done();
  //       } catch (e) {
  //         done(e);
  //       }
  //     }
  //   });
  // });

  // it('query.TagValue(callback)', function(done) {
  //   cayleyClient.g.type('query').V("</user/shortid/23TplPLs>").Tag("userId").In("<follows>").TagValue(function(data) {
  //     for (var idx in data) {
  //       g.Emit(data[idx]);
  //     }
  //   }, function(err, res) {
  //     console.log(res);
  //     if (err) {
  //       done(err);
  //     } else {
  //       try {
  //         assert.isString(res.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
  //         done();
  //       } catch (e) {
  //         done(e);
  //       }
  //     }
  //   });
  // });

  
  //  * Watch: try to understand the design here, the 'gizmoCallback' should satisfy the following conditions:
  //  *   1. No any reference to anything outside of this function, only pure js code.
  //  *     - Coz this function will be stringified and committed to cayley server, and then get executed there.
  //  *     - ES6 'arrow function' and other advanced features whether can be supported haven't been tested.
  //  *   2. Can use the APIs exposed by this lib belong to 'Path' object.
   
  // it("Missed 'gizmoCallback' function in 'query.ForEach(gizmoCallback, callback)'", function() {
  //   assert.throws(function() {
  //     pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
  //       .V("</user/shortid/23TplPLs>").In().ForEach(function(err, res) {});
  //   });
  // });

  // it('query.ForEach(gizmoCallback, callback)', function(done) {
  //   pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
  //     .V("</user/shortid/23TplPLs>").In().ForEach(function(data) {
  //       g.Emit(data);
  //     }, function(err, res) {
  //       if (err) {
  //         done(err);
  //       } else {
  //         try {
  //           assert.isArray(res.result);
  //           done();
  //         } catch (e) {
  //           done(e);
  //         }
  //       }
  //     });
  // });

  // it("Missed 'gizmoCallback' function in 'query.ForEach(limit, gizmoCallback, callback)'", function() {
  //   assert.throws(function() {
  //     pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
  //       .V("</user/shortid/23TplPLs>").In().ForEach(1, function(err, res) {});
  //   });
  // });

  // it('query.ForEach(limit, gizmoCallback, callback)', function(done) {
  //   pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
  //     .V("</user/shortid/23TplPLs>").In().ForEach(1, function(data) {
  //       g.Emit(data);
  //     }, function(err, res) {
  //       if (err) {
  //         done(err);
  //       } else {
  //         try {
  //           assert.isArray(res.result);
  //           expect(res.result).to.have.length.most(1, 'https://github.com/cayleygraph/cayley/issues/518');
  //           done();
  //         } catch (e) {
  //           done(e);
  //         }
  //       }
  //     });
  // });

});


