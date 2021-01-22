const fs = require('fs');
const SECRETS_PATH = './secrets.json';

module.exports = function getAuth() {
  let user, pass;
  const { EMAIL, EMAIL_APP_PASSWORD } = process.env;

  if (EMAIL && EMAIL_APP_PASSWORD) {
    user = EMAIL;
    pass = EMAIL_APP_PASSWORD;
  } else {
    try {
      if (fs.existsSync(SECRETS_PATH)) {
        const { email, password } = JSON.parse(fs.readFileSync(SECRETS_PATH));
        user = email;
        pass = password;
      }
    } catch(err) {
      console.error(err);
    }
  }

  if (!user || !pass) {
    throw new Error('Unable to find user, pass. Please add them to the environment as EMAIL and EMAIL_APP_PASSWORD' +
     ' or in secrets.json as { email, password }');
  }
  return { user, pass };
};
