Meteor.methods({

  // Note: this requires the Check package to be installed. You should also install
  // the audit-argument-checks package to help catch yourself forgetting to check
  // arguments passed to methods.
  updateUserName: function(update){
    // First, check our update object against our expected pattern.
    check(update, {auth: String, id: String, name: String});

    // Now, since we're on the server, we can ensure that the auth value
    // passed to our method is valid.
    if ( update.auth == SERVER_AUTH_TOKEN ) {
      Meteor.users.update(update.id,{
        $set: {
          "profile.name": update.name
        }
      });
    } else {
      throw new Meteor.Error('invalid-auth-token', 'Sorry, your server authentication token is invalid.');
    }
  }

});
