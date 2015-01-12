Meteor.startup(function(){

  // Note: this requires the Random package to be installed (`meteor add random`).
  // On startup, we create a global server variable called SERVER_AUTH_TOKEN that
  // is set to the value of a call to the Random.secret() method. This creates a
  // 43 character string that we can use to check whether a method can be called
  // from the client.

  SERVER_AUTH_TOKEN = Random.secret();
  // See Random docs here for additional options: http://docs.meteor.com/#/full/random

});
