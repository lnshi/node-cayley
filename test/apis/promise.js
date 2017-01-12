'use strict';

const path = require('path');

const {cayleyInstancePools, assert, expect, should} = require('./initialize')(true);

const pickRandomly = cayleyInstancePools[0].pickRandomly;

describe('Cayley bluebird Promise style HTTP APIs', function() {

  it('/write', function() {
    return pickRandomly(pickRandomly(cayleyInstancePools)).write([
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
    ]).then(function(resBody) {
      expect(resBody.result).to.be.a('string');
      expect(resBody.result).to.include('Successfully');
    });
  });

  it('/write/file/nquad', function() {
    return pickRandomly(pickRandomly(cayleyInstancePools)).writeFile(
      path.resolve(__dirname, '../data/friend_circle_with_label.nq')
    ).then(function(resBody) {
      expect(resBody.result).to.be.a('string');
      expect(resBody.result).to.include('Successfully');
    });
  });

  // https://github.com/cayleygraph/cayley/issues/517
  it('/delete', function() {
    return pickRandomly(pickRandomly(cayleyInstancePools)).delete([
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
    ]).then(function(resBody) {
      expect(resBody.result).to.be.a('string');
      expect(resBody.result).to.include('Successfully');
    });
  });

});


