const { assert } = require('chai');

const {
  getUserIDFromEmail,
  addNewUser,
  addNewURL,
  shortUrlExists,
  newEmailAlreadyUsed,
  newUserHasBlankFields,
  isLoggedIn,
  passwordIsCorrect,
  urlsByUser,
  userOwnsUrl
} = require('../helpers');

const testUsers = {
  'aJ48lW': {
    id: 'aJ48lW',
    email: 'g@nzo.dev',
    password: '$2a$10$JjFdkaipEp/8v6rXLhP3EunU4e4R8X.W6aJLn1K6h4JKpbkavoYuS' // pw = 'lol'
  },
  'yu0p44': {
    id: 'yu0p44',
    email: 'g@nzo.com',
    password: '$2a$10$QmOTsuK8oZkAL8cidgjEgOtu0KOv1OMkOeITTugrCTflBb7hAA.bG' // pw = 'gg'
  },
  'eez212': {
    id: 'eez212',
    email: 'hi@implicitaudio.ca',
    password: '$2a$10$yJSAt5TGErmWIA/pU6N/N.3xLJxeR7DvqWvLR7jvqFpZrPd7Jto8O' // pw = 'a'
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.implicitaudio.ca',
    userID: 'yu0p44'
  },
  i3BoGr: {
    longURL: 'https://www.shopify.com',
    userID: 'aJ48lW'
  },
  y4tjj1: {
    longURL: 'https://www.guitarcabinets.ca',
    userID: 'yu0p44'
  }
};

describe('getUserIDFromEmail', () => {
  it('returns user ID that matches expected user ID when passed a valid email', () => {
    const user = getUserIDFromEmail('hi@implicitaudio.ca', testUsers);
    const expectedUserID = 'eez212';
    assert.strictEqual(user, expectedUserID);
  });
  it('returns undefined when passed an invalid email', () => {
    const user = getUserIDFromEmail('hello@implicitaudio.ca', testUsers);
    assert.isUndefined(user, undefined);
  });
});

describe('addNewUser', () => {
  it('returns a new user ID after adding new user to users database', () => {
    const oldKeys = Object.keys(testUsers);
    const newUserID = addNewUser('testing@implicitaudio.ca', 'hunter2', testUsers);
    assert.notInclude(oldKeys, newUserID, 'unexpectedly found new user ID in list of old user IDs!');
  });
  it('returns a user ID that contains the expected email and password after adding new user to users database', () => {
    const newUserID = addNewUser('testing@implicitaudio.ca', 'hunter2', testUsers);
    assert.strictEqual(testUsers[newUserID].email, 'testing@implicitaudio.ca', 'Email check failed!');
    assert.strictEqual(testUsers[newUserID].password, 'hunter2', 'Password check failed!');
  });
});

describe('addNewURL', () => {
  const oldShortUrls = Object.keys(testUrlDatabase);
  const newShortUrl = addNewURL('https://www.wired.com', 'eez212', testUrlDatabase);
  it('returns a new short URL after adding new long URL to database', () => {
    assert.notInclude(oldShortUrls, newShortUrl, 'unexpectedly found new short URL in list of old short URLs!');
  });
  it('returns a short URL that contains the expected long URL and user ID after adding new long URL to URL database', () => {
    assert.strictEqual(testUrlDatabase[newShortUrl].longURL, 'https://www.wired.com', 'URL check failed!');
    assert.strictEqual(testUrlDatabase[newShortUrl].userID, 'eez212', 'User ID check failed!');
  });
});

describe('shortUrlExists', () => {
  it('returns true for valid short URL', () => {
    assert.isTrue(shortUrlExists('b6UTxQ', testUrlDatabase), 'valid short URL check failed!');
  });
  it('returns false for invalid short URL', () => {
    assert.isFalse(shortUrlExists('sdfasdfhajksd', testUrlDatabase), 'invalid short URL check failed!');
  });
});

describe('newEmailAlreadyUsed', () => {
  it('returns true for email that is already in use', () => {
    assert.isTrue(newEmailAlreadyUsed('g@nzo.dev', testUsers), 'in-use email check failed!');
  });
  it('returns false for email that is not in use', () => {
    assert.isFalse(newEmailAlreadyUsed('g@nzo.deadsfasdfasdfsav', testUsers), 'not-in-use email check failed!');
  });
});

describe('newUserHasBlankFields', () => {
  it('returns true when both fields are empty strings', () => {
    assert.isTrue(newUserHasBlankFields('', ''), 'expected true when email & password are empty strings!');
  });
  it('returns true when email argument is an empty string', () => {
    assert.isTrue(newUserHasBlankFields('', 'hunter2'), 'expected true when email is an empty string!');
  });
  it('returns true when password argument is an empty string', () => {
    assert.isTrue(newUserHasBlankFields('g@nzo.dev', ''), 'expected true when password is an empty string!');
  });
  it('returns false when both fields are not empty strings', () => {
    assert.isFalse(newUserHasBlankFields('g@nzo.dev', 'hunter2'), 'expected false when neither field is an empty string!');
  });
});

describe('passwordIsCorrect', () => {
  it('returns true when password is correct', () => {
    assert.isTrue(passwordIsCorrect('aJ48lW', 'lol', testUsers), 'correct password check failed!');
  });
  it('returns false when password is incorrect', () => {
    assert.isFalse(passwordIsCorrect('aJ48lW', 'loooollll', testUsers), 'incorrect password check failed!');
  });
});

describe('urlsByUser', () => {
  it('returns only the URLs that belong to the user ID', () => {
    assert.deepEqual(
      urlsByUser('aJ48lW', testUrlDatabase),
      [['i3BoGr', { longURL: 'https://www.shopify.com', userID: 'aJ48lW' }]],
      'user ID with URLs check failed!'
    );
  });
  it('returns empty array when user ID doesn not own any URLs', () => {
    assert.deepEqual(
      urlsByUser('asdfbnasdjJ48lW', testUrlDatabase),
      [],
      'user ID without URLs check failed!'
    );
  });
  it('returns empty array when passed an empty string for user ID', () => {
    assert.deepEqual(
      urlsByUser('', testUrlDatabase),
      [],
      'user ID without URLs check failed!'
    );
  });
});

describe('', () => {
  it('', () => {

  });
});