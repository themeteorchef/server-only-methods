Meteor.methods({

  anotherMethod: function(){
    // Just for the sake of example, here we're calling to our secure method,
    // updateUserName, from within another method.
    var update = {
      auth: SERVER_AUTH_TOKEN, // This will be accessible because we're on the server.
      id: Meteor.userId(),
      name: "John Doe"
    }

    Meteor.call('updateUserName', update, function(error){
      if(error){
        console.log(error);
      }
    });
  }
});
