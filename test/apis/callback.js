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
                assert.equal(readResBody.length, writeResBody.count);

                /*
                 * Test API: /v2/delete
                 * Delete the tested inserted data.
                 */
                cayleyClient.delete([
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
              primaryKey: '</user/shortid/23TplPdS>',

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
      function(err, resBody) {
        if (err) {
          done(err);
        } else {
          try {
            expect(resBody.result).to.be.a('string');
            expect(resBody.result).to.include('Successfully');

            /*
             * Delete the inserted data correctly.
             */
            cayleyClient.delete([
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
            ], function(err, deleteResBody) {
              // { result: 'Successfully wrote 11 quads.', count: 11 }
              if (err) {
                done(err);
              } else {
                try {
                  expect(deleteResBody.result).to.be.a('string');
                  expect(deleteResBody.result).to.include('Successfully');
                  expect(resBody.result).to.include(deleteResBody.count);
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

// describe('Cayley callback style Gizmo APIs', function() {

//   it("'promisify' was set to false, but no 'callback' provided.", function() {
//     assert.throws(function() {
//       cayleyClient.g.type('query').V().All();
//     }, Error);
//   });

//   it("Invalid type for Gizmo, valid types are: 'query' or 'shape'.", function() {
//     assert.throws(function() {
//       cayleyClient.g.type('lalala').V().All();
//     });
//   });

//   it('query.All(callback)', function(done) {
//     cayleyClient.g.type('query').V().All(function(err, resBody) {
//       if (err) {
//         done(err);
//       } else {
//         try {
//           assert.isArray(resBody.result);
//           done();
//         } catch (e) {
//           done(e);
//         }
//       }
//     });
//   });

//   it('query.GetLimit(size, callback)', function(done) {
//     cayleyClient.g.type('query').V().GetLimit(1, function(err, resBody) {
//       if (err) {
//         done(err);
//       } else {
//         try {
//           assert.isArray(resBody.result);
//           expect(resBody.result).to.have.length.most(1);
//           done();
//         } catch (e) {
//           done(e);
//         }
//       }
//     });
//   });

//   it('query.ToArray(callback)', function(done) {
//     cayleyClient.g.type('query').V("</user/shortid/23TplPdS>").Tag("userId").In("<follows>").ToArray(function(data) {
//       for (var idx in data) {
//         g.Emit(data[idx]);
//       }
//     }, function(err, resBody) {
//       if (err) {
//         done(err);
//       } else {
//         try {
//           assert.isArray(resBody.result);
//           done();
//         } catch (e) {
//           done(e);
//         }
//       }
//     });
//   });

//   it('query.ToValue(callback)', function(done) {
//     cayleyClient.g.type('query').V("</user/shortid/23TplPdS>").Tag("userId").In("<follows>").ToValue(function(data) {
//       g.Emit(data);
//     }, function(err, resBody) {
//       console.log(resBody.result);
//       if (err) {
//         done(err);
//       } else {
//         try {
//           assert.isString(resBody.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
//           done();
//         } catch (e) {
//           done(e);
//         }
//       }
//     });
//   });

//   it('query.TagArray(callback)', function(done) {
//     cayleyClient.g.type('query').V("</user/shortid/23TplPdS>").Tag("userId").In("<follows>").TagArray(function(data) {
//       for (var idx in data) {
//         g.Emit(data[idx]);
//       }
//     }, function(err, resBody) {
//       console.log(resBody);
//       if (err) {
//         done(err);
//       } else {
//         try {
//           assert.isArray(resBody.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
//           done();
//         } catch (e) {
//           done(e);
//         }
//       }
//     });
//   });

//   it('query.TagValue(callback)', function(done) {
//     cayleyClient.g.type('query').V("</user/shortid/23TplPdS>").Tag("userId").In("<follows>").TagValue(function(data) {
//       for (var idx in data) {
//         g.Emit(data[idx]);
//       }
//     }, function(err, resBody) {
//       console.log(resBody);
//       if (err) {
//         done(err);
//       } else {
//         try {
//           assert.isString(resBody.result, 'Refer to: https://github.com/cayleygraph/cayley/issues/171');
//           done();
//         } catch (e) {
//           done(e);
//         }
//       }
//     });
//   });

  
//   //  * Watch: try to understand the design here, the 'gizmoCallback' should satisfy the following conditions:
//   //  *   1. No any reference to anything outside of this function, only pure js code.
//   //  *     - Coz this function will be stringified and committed to cayley server, and then get executed there.
//   //  *     - ES6 'arrow function' and other advanced features whether can be supported haven't been tested.
//   //  *   2. Can use the APIs exposed by this lib belong to 'Path' object.
   
//   // it("Missed 'gizmoCallback' function in 'query.ForEach(gizmoCallback, callback)'", function() {
//   //   assert.throws(function() {
//   //     pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
//   //       .V("</user/shortid/23TplPdS>").In().ForEach(function(err, resBody) {});
//   //   });
//   // });

//   // it('query.ForEach(gizmoCallback, callback)', function(done) {
//   //   pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
//   //     .V("</user/shortid/23TplPdS>").In().ForEach(function(data) {
//   //       g.Emit(data);
//   //     }, function(err, resBody) {
//   //       if (err) {
//   //         done(err);
//   //       } else {
//   //         try {
//   //           assert.isArray(resBody.result);
//   //           done();
//   //         } catch (e) {
//   //           done(e);
//   //         }
//   //       }
//   //     });
//   // });

//   // it("Missed 'gizmoCallback' function in 'query.ForEach(limit, gizmoCallback, callback)'", function() {
//   //   assert.throws(function() {
//   //     pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
//   //       .V("</user/shortid/23TplPdS>").In().ForEach(1, function(err, resBody) {});
//   //   });
//   // });

//   // it('query.ForEach(limit, gizmoCallback, callback)', function(done) {
//   //   pickRandomly(pickRandomly(cayleyInstancePools)).g.type('query')
//   //     .V("</user/shortid/23TplPdS>").In().ForEach(1, function(data) {
//   //       g.Emit(data);
//   //     }, function(err, resBody) {
//   //       if (err) {
//   //         done(err);
//   //       } else {
//   //         try {
//   //           assert.isArray(resBody.result);
//   //           expect(resBody.result).to.have.length.most(1, 'https://github.com/cayleygraph/cayley/issues/518');
//   //           done();
//   //         } catch (e) {
//   //           done(e);
//   //         }
//   //       }
//   //     });
//   // });

// });


