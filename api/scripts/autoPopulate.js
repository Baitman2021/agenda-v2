const db              = require('../lib/db');
const ObjectID        = require('mongoose').Types.ObjectId;
const { genPassword } = require('../lib/utils/password');
const User            = require('../lib/models/user');
const Meeting         = require('../lib/models/meeting');
const { clean }       = require('../test/utils/db');
const faker           = require('faker');
const assert          = require('assert');

const TEST_PASS  = 'test';
const TEST_USER  = 'test';
const TEST_EMAIL = 'test@test.com';

const fakeUsers = [];

/**
 * Create the user for testing
 * @returns {Promise} test user doc
 */
async function createTestUser() {
  const { hash, salt } = genPassword( TEST_PASS );

  return User.create({
    username: TEST_USER,
    email:    TEST_EMAIL,
    hash,
    salt
  });
}

/**
 * Create users for testing
 * @param {Number} count - number of users
 * @returns {Promize} - users created
 */
async function populateFakeUsers( count ) {
  const users = [];

  for ( let i = 0; i < count; i++ ) {
    const { hash, salt } = genPassword( faker.internet.password() );

    const user = {
      username: faker.internet.userName(),
      email:    faker.internet.email(),
      hash,
      salt
    };

    users.push( user );
  }

  return User.insertMany( users );
}

/**
 * Create meetings for testing with provided ownerid
 * @param {Number} count - number of meetings to create
 * @param {String} userId - userId of meeting owner
 * @returns {Promise} - meetings created
 */
async function populateFakeMeetings( count, userId ) {
  const meetings = [];

  for ( let i = 0; i < count; i++ ) {
    const date = Math.random() > .2 ? faker.date.soon() : faker.date.recent();

    const meeting = {
      name:     faker.company.companyName() + ' Acquisition',
      owner_id: userId,
      date
    };

    meetings.push( meeting );
  }

  return Meeting.insertMany( meetings );
}

/**
 * Add test user and some related meetings for local dev
 * @returns {Promise} - database hydrated
 */
async function hydrateDB() {
  try {
    await db.connect();
    await clean();

    const user = await createTestUser();

    await populateFakeUsers( 100 );
    await populateFakeMeetings( 20, user._id );

  } catch ( err ) {
    console.log( err );
  } finally {
    await db.disconnect();
  }
}

hydrateDB();