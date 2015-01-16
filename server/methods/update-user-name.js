Meteor.methods({

  // Note: this requires the Check package to be installed. You should also install
  // the audit-argument-checks package to help catch yourself forgetting to check
  // arguments passed to methods.
  updateUserName: function(update){
    // First, check our update object against our expected pattern.
    check(update, {id: String, name: String});

    /*
     UPDATED: 01/16/15
     Thanks to @richsilvo and Ben Green (on Crater.io) for explaining that the
     auth token is unnecessary. Instead, we can test whether
     this.connection == null in our method (this would be TRUE if the method is
     called from your server code). See the setTimeout() pattern in
     /server/startup.js to see that when called from the server (i.e. you don't
     do Meteor.call() in your browser console, it returns null). If called from
     the client, this.connection returns an object with connection data.
    */
    if ( this.connection == null ) {
      Meteor.users.update(update.id,{
        $set: {
          "profile.name": update.name
        }
      });
    } else {
      throw new Meteor.Error('server-only-method', 'Sorry, this method can only be called from the server.');
    }
  }
});
