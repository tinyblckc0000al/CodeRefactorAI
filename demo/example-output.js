/**
 * Example Output - CodeRefactorAI Demo
 */

const exampleOutput = `function logUserName(user) {
  console.log("Processing user: " + user.name);
}

function logUserEmail(user) {
  console.log("Email: " + user.email);
}

function logUserAge(user) {
  console.log("Age: " + user.age);
}

function logUserAddress(user) {
  console.log("Address: " + user.address);
}

function processUserData(user) {
  logUserName(user);
  logUserEmail(user);
  logUserAge(user);
  logUserAddress(user);
  return user;
}`;

module.exports = { exampleOutput };