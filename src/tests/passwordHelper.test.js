const assert = require('assert');
const PasswordHelper = require('../helpers/passwordHelper');

const PASSWORD = 'Sofia@3123123';
const HASH = '$2b$04$nQszQzk6fCT71.bQ.Ap5b.xM5yplRiiASPy3X.09b8F8vtGsP5K8a';

describe('UserHelper test suite', function () {
  it('should generate a hash from a password', async () => {
    const result = await PasswordHelper.hashPassword(PASSWORD);
    assert.ok(result.length > 10);
  });

  it('should compare password and hash', async () => {
    const result = await PasswordHelper.comparePassword(PASSWORD, HASH);
    assert.ok(result);
  });
});
