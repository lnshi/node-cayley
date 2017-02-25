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

  it('graph.Vertex([nodeId, ...])', function() {
    return cayleyClient.g.type('shape').V(['</user/shortid/23TplPdS>', '</user/shortid/46Juzcyx>']).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('graph.Morphism()', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Out(predicatePath, tag)', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>', 'predicate').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Out(predicatePath, [tag, ...])', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>', ['predicate', 'ifExtraTag?']).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Out([predicatePath, ...], [tag, ...])', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Out(['<follows>', '<userId>'], ['predicate', 'extraTag']).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Out([predicatePath, ...], tag)', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Out(
      cayleyClient.g.V(['<userId>', '<userSetId>']), 'predicate'
    ).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Out([predicatePath, ...], [tag, ...])', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Out(
      cayleyClient.g.V(['<userId>', '<userSetId>']), ['predicate', 'extraTag']
    ).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.In(predicatePath, tag)', function() {
    return cayleyClient.g.V('false').In('<isEmailVerified>', 'predicate').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.In(predicatePath, [tag, ...])', function() {
    return cayleyClient.g.V('false').In('<isEmailVerified>', ['predicate', 'ifExtraTag?']).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.In([predicatePath, ...], [tag, ...])', function() {
    return cayleyClient.g.V('false').In(['<isEmailVerified>', '<isVerified>'], ['predicate', 'extraTag']).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.In([predicatePath, ...], tag)', function() {
    return cayleyClient.g.V('false').In(
      cayleyClient.g.V(['<isEmailVerified>', '<isVerified>']), 'predicate'
    ).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.In([predicatePath, ...], [tag, ...])', function() {
    return cayleyClient.g.V('false').In(
      cayleyClient.g.V(['<isEmailVerified>', '<isVerified>']), ['predicate', 'extraTag']
    ).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Both([predicatePath], [tags])', function() {
    return cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').Both('<follows>', 'predicate').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Is(node)', function() {
    return cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Is('</user/shortid/46Juzcyx>').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Is([node, ...])', function() {
    return cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>')
      .Is(['</user/shortid/46Juzcyx>', '</user/shortid/hwX6aOr7>', '</user/fake/value>']).All().then((res) => {
        assert.isArray(res.result);
      });
  });

  it('path.Is(node), and not match', function() {
    return cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Is('</user/fake/value>').All().then((res) => {
      assert.isNull(res.result);
    });
  });

  it('path.Is(node), pass in nothing', function() {
    return cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Is().All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Has(predicatePath, node)', function() {
    return cayleyClient.g.V().Has('<gender>', 'F').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.LabelContext(), pass in nothing', function() {
    return cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').LabelContext().In('<follows>').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.LabelContext(labelPath, tag)', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').LabelContext('companyA', 'label').In('<follows>').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.LabelContext(labelPath, [tag, ...])', function() {
    return cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').LabelContext('companyA', ['label', 'extraTag']).In('<follows>').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.LabelContext([labelPath, ...], [tag, ...])', function() {
    return cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').LabelContext(['companyB', 'companyB'], ['label', 'extraTag'])
      .In('<follows>').All().then((res) => {
        assert.isNull(res.result);
      });
  });

  it('path.Limit(limit)', function() {
    return cayleyClient.g.V('M').In('<gender>').Limit(1).All().then((res) => {
      assert.isArray(res.result);
      assert.equal(res.result.length, 1);
    });
  });

  it('path.Limit(), missing required parameter, expect error', function() {
    return cayleyClient.g.V('M').In('<gender>').Limit().All().then((res) => {
      assert.isNotNull(res.error);
    });
  });

  it('path.Skip(offset), skip 0', function() {
    return cayleyClient.g.V().Has('<alpha3CountryCode>', 'SGP').Skip(0).All().then((res) => {
      assert.isArray(res.result);
      assert.equal(res.result.length, 3);
    });
  });

  it('path.Skip(offset), skip 2', function() {
    return cayleyClient.g.V().Has('<alpha3CountryCode>', 'SGP').Skip(2).All().then((res) => {
      assert.isArray(res.result);
      assert.equal(res.result.length, 1);
    });
  });

  it('path.Skip(), missing required parameter, expect error', function() {
    return cayleyClient.g.V().Has('<alpha3CountryCode>', 'SGP').Skip().All().then((res) => {
      assert.isNotNull(res.error);
    });
  });

  it('path.InPredicates()', function() {
    return cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').InPredicates().All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.InPredicates()', function() {
    return cayleyClient.g.V('true').InPredicates().All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.OutPredicates()', function() {
    return cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').OutPredicates().All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Tag(tag)', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Tag('step_0').Out('<follows>').Tag('step_1')
      .In('<follows>').Tag('step_2').All().then((res) => {
        assert.isArray(res.result);
      });
  });

  it('path.Tag([tag, ...])', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Tag(['step_0', 'extraTag']).Out('<follows>').Tag('step_1')
      .In('<follows>').Tag('step_2').All().then((res) => {
        assert.isArray(res.result);
      });
  });

  it('path.As([tag, ...])', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Tag(['step_0', 'extraTag']).Out('<follows>').Tag('step_1')
      .In('<follows>').Tag('step_2').All().then((res) => {
        assert.isArray(res.result);
      });
  });

  it('path.Back(tag), access intermediate results', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>').Tag('myFollowees')
      .In('<follows>').Has('<gender>', 'F').Back('myFollowees').All().then((res) => {
        assert.isArray(res.result);
      });
  });

  it('path.Back(tag), take another route', function() {
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>').Tag('myFollowees')
      .In('<follows>').Has('<gender>', 'F').Back('myFollowees').Out('<mobilePhone>').Tag('mobilePhone').All().then((res) => {
        assert.isArray(res.result);
      });
  });

  it('path.Save(predicate, tag)', function() {
    return cayleyClient.g.V('</user/shortid/BJg4Kj2HOe>').Save('<follows>', 'target').All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Intersect(query)', function() {
    const queryA = cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>');
    const queryB = cayleyClient.g.V('</user/shortid/hwX6aOr7>').Out('<follows>');
    return queryA.Intersect(queryB).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.And(query)', function() {
    const queryA = cayleyClient.g.V('</user/shortid/46Juzcyx>').Out('<follows>');
    const queryB = cayleyClient.g.V('</user/shortid/hwX6aOr7>').Out('<follows>');
    return queryA.And(queryB).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Union(query)', function() {
    const queryA = cayleyClient.g.V().Tag('user').In('<follows>').Has('<gender>', 'F').Back('user');
    const queryB = cayleyClient.g.V().Tag('user').Out('<mobilePhone>').Out('<isVerified>').Tag('mobileNoVerified').Is('true');
    return queryA.Union(queryB).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Or(query)', function() {
    const queryA = cayleyClient.g.V().Tag('user').In('<follows>').Has('<gender>', 'F').Back('user');
    const queryB = cayleyClient.g.V().Tag('user').Out('<mobilePhone>').Out('<isVerified>').Tag('mobileNoVerified').Is('true');
    return queryA.Or(queryB).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Except(query)', function() {
    const queryA = cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>');
    const queryB = cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Has('<gender>', 'M');
    return queryA.Except(queryB).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.Difference(query)', function() {
    const queryA = cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>');
    const queryB = cayleyClient.g.V('</user/shortid/23TplPdS>').In('<follows>').Has('<gender>', 'M');
    return queryA.Difference(queryB).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('path.FollowR(morphism)', function() {
    const willBeReversedQuery = cayleyClient.g.M().Out('<follows>');
    return cayleyClient.g.V('</user/shortid/23TplPdS>').FollowR(willBeReversedQuery).All().then((res) => {
      assert.isArray(res.result);
    });
  });

  it('query.GetLimit(size, callback)', function() {
    return cayleyClient.g.V().GetLimit(1).then((res) => {
      assert.isArray(res.result);
      expect(res.result).to.have.length.most(1);
    });
  });

  it('query.ToArray(gizmoFunc, callback)', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).ToArray(function(data) {
      for (var item in data) {
        g.Emit(data[item]);
      }
    }).then((res) => {
      assert.isArray(res.result);
    });
  });

  it('query.TagArray(gizmoFunc, callback)', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out('<mobilePhone>').Tag('mobilePhone');
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).TagArray(function(data) {
      for (var item in data) {
        g.Emit(data[item]);
      }
    }).then((res) => {
      assert.isArray(res.result);
    });
  });

  it('query.ToValue(gizmoFunc, callback)', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).ToValue(function(data) {
      g.Emit(data);
    }).then((res) => {
      assert.isArray(res.result);
    });
  });

  it('query.TagValue(gizmoFunc, callback)', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out('<mobilePhone>').Tag('mobilePhone');
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).TagValue(function(data) {
      g.Emit(data);
    }).then((res) => {
      assert.isArray(res.result);
    });
  });

  it('query.ForEach(gizmoFunc, callback)', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).ForEach(function(data) {
      for (var item in data) {
        g.Emit(data[item]);
      }
    }).then((res) => {
      assert.isArray(res.result);
    });
  });

  it('query.ForEach(limit, gizmoFunc, callback)', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).ForEach(1, function(data) {
      for (var item in data) {
        g.Emit(data[item]);
      }
    }).then((res) => {
      assert.isArray(res.result);
    });
  });

  it('query.Map(gizmoFunc, callback)', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).Map(function(data) {
      for (var item in data) {
        g.Emit(data[item]);
      }
    }).then((res) => {
      assert.isArray(res.result);
    });
  });

  it('query.Map(limit, gizmoFunc, callback)', function() {
    const popularQuery = cayleyClient.g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
    return cayleyClient.g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).Map(1, function(data) {
      for (var item in data) {
        g.Emit(data[item]);
      }
    }).then((res) => {
      assert.isArray(res.result);
    });
  });

});


