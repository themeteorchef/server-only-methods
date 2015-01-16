Meteor.startup(function(){

  /*
   UPDATED: 01/16/15
   Thanks to @richsilvo and Ben Green (on Crater.io) for explaining that the
   auth token is unnecessary. Instead, we can make use of this.connection
   within our method to determine whether a method was called from the server.
   Here, we've defined a setTimeout that will fire a call to our updateUserName
   method 5 seconds after startup, successfully calling our method. If we
   attempted to call updateUserName from the client (e.g. your browser console)
   Meteor would throw the error we've defined in our method. Nice!
  */
  setTimeout(function(){
    var update = {
      id: Meteor.userId(),
      name: "John Doe"
    }

    Meteor.call('updateUserName', update, function(){
      if (error) {
        console.log(error);
      }
    });
  }, 5000);

});
