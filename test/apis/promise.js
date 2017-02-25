'use strict';

const path = require('path');

const {cayleyClient, assert, expect, should} = require('./initialize')(true);

const testData = require('../data/friend_circle_with_label.nq.equivalent_json');

describe('Cayley bluebird Promise style HTTP APIs', function() {

  it('/v1/write & /v2/read & /v1/delete', function() {
    /*
     * Test API: '/v1/write'.
     */
    return cayleyClient.write(testData).then((writeResBody) => {
      expect(writeResBody.result).to.be.a('string');
      expect(writeResBody.result).to.include('Successfully');

      /*
       * Test API: '/v2/read'.
       */
      return cayleyClient.read().then((readResBody) => {
        assert.isArray(readResBody);
        assert.equal(readResBody.length, 42);

        /*
         * Test API: '/v1/delete'.
         *   Delete the tested inserted data.
         */
        return cayleyClient.delete(testData).then((deleteResBody) => {
          expect(deleteResBody.result).to.be.a('string');
          expect(deleteResBody.result).to.include('Successfully');

          /*
           * Use '/v2/read' API to verify.
           */
          return cayleyClient.read().then((readResBody) => {
            assert.isNull(readResBody);
          });
        });
      });
    });
  });

});

describe('Cayley bluebird Promise style HTTP APIs', function() {

  it("'Write' with 'label', but 'delete' without providing 'label', expect deletion to be failed.", function() {
    /*
     * '/v1/write' data with 'label'.
     */
    return cayleyClient.write([
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
    ]).then((writeResBody) => {
      expect(writeResBody.result).to.be.a('string');
      expect(writeResBody.result).to.include('Successfully');

      /*
       * But try to use '/v1/delete' to delete data without providing 'label', expect deletion to be failed.
       */
      return cayleyClient.delete([
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
      ]).then((wronglyDeleteResBody) => {

        // After checked the MongoDB, cayley deleted nothing, but still returned: { result: 'Successfully deleted 11 quads.' }
        // So we use the '/v2/read' API to check.

        /*
         * Check with '/v2/read'.
         */
        return cayleyClient.read().then((readResBody) => {
          assert.isArray(readResBody);
          assert.equal(readResBody.length, 6);

          /*
           * Delete the inserted data correctly with '/v1/delete'.
           */
          return cayleyClient.delete([
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
          ]).then((correctlyDeleteResBody) => {
            expect(correctlyDeleteResBody.result).to.be.a('string');
            expect(correctlyDeleteResBody.result).to.include('Successfully');

            /*
             * Use '/v2/read' to verify.
             */
            return cayleyClient.read().then((readResBody) => {
              assert.isNull(readResBody);
            });
          });
        });

      });
    });
  });

});

describe('Cayley bluebird Promise style Gizmo APIs', function() {

  before(function(done) {
    cayleyClient.write(testData).then((res) => {
      done();
    }).catch((err) => {
      done(err);
    });
  });

  after(function(done) {
    cayleyClient.delete(testData).then((res) => {
      /*
       * Use '/v2/read' to verify the test cases didn't pollute the user db.
       */
      return cayleyClient.read();
    }).then((res) => {
      if (res) {
        done(new Error('Your db got polluted by this test, please report this issue!!!'));
      } else {
        done();
      }
    }).catch((err) => {
      done(err);
    });
  });

  it('graph.Vertex(nodeId)', function() {
    return cayleyClient.g.V('</user/shortid/23TplPdS>').All().then((res) => {
      assert.isArray(res.result);
    });
  });

});


