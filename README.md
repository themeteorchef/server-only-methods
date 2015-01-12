#### Preventing Client Calls to a Server-Only Method

Technically, Meteor's methods are exposed to the client, meaning any user can determine a method we've written and call it from the client. Sometimes, though, we have server methods that we *do not* want accessible from the client. The following pattern showcases how to prevent client-side method calls by making use of the Random package and a bit of elbow grease.

#### What we're trying to accomplish

As an example, we have a method called `updateUserName` that we only want accessible on the server. We do *not* want a user (or other bad actor) able to update their name from the client. An **insecure** version of our method call on the client would look like this:

```
var update = {
  id: Meteor.userId(),
  name: "John Doe"
}

Meteor.call('updateUserName', update, function(error){
  if(error){
    console.log(error);
  }
});
```

As-is, if our method only performed an insert on the server, any user could technically
call this and update their name whenever they wanted. To prevent this, we need to lock up our method on the server.

```
Meteor.methods({
  updateUserName: function(update){
    check(update, {auth: String, id: String, name: String});

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
```

Notice that in the method definition above, we're taking our `update` object passed from the client and making use of the [Check](http://docs.meteor.com/#/full/check) package to validate its properties. But what is the `auth` part? This is how we can lock down our method. What we're saying here is that our method requires an `auth` value passed from the client.

By default, this will throw an error on the server if the object passed does *not* include an auth value. This isn't enough, though. If a user figures this out, they can just pass an `auth` value as well. Our solution comes a few lines down when we compare our passed `update.auth` value against another variable `SERVER_AUTH_TOKEN`. What the heck is that?

#### Our Solution
This is the fun part. `SERVER_AUTH_TOKEN` is a global variable that's only accessible on the server. We define the value on our server startup:

```
Meteor.startup(function(){
  SERVER_AUTH_TOKEN = Random.secret();
});
```

Here, we're making use of the [Random](http://docs.meteor.com/#/full/random) package to create a random, 43 character string for us. What this affords us is a totally random string generated on startup that's _only_ accessible on the server.

This is great, because we can now validate against this value in our methods. When a method is called from the server, we pass the value of `SERVER_AUTH_TOKEN` with it, allowing the method to be called. On the client, though, there is no way of figuring out this value, meaning that a client cannot call the method successfully. If they do, they'd get whatever error we throw from our method:

```
throw new Meteor.Error('invalid-auth-token', 'Sorry, your server authentication token is invalid.');
```

So, somewhere on our server, we can call the following and rest assured that it will only execute there:

```
var update = {
  auth: SERVER_AUTH_TOKEN,
  id: Meteor.userId(),
  name: "John Doe"
}

Meteor.call('updateUserName', update, function(error){
  if(error){
    console.log(error);
  }
});
```

#### Wrap Up
So there we go, a quick pattern for securing methods so that they can only be called from the server! Handy. This was discovered in passing while I was working on Recipe #5, Building a SaaS with Meteor: Stripe where I'll be showcasing how to integrate Stripe in a Meteor app. If you want to see it in action, make sure to [sign up for the mailing list](http://themeteorchef.us8.list-manage2.com/subscribe?u=8cffd428bf025d80425da063c&id=a347eecb12). If you have any improvements to this snippet, feel free to share and submit a Pull Request!
