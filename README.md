#### Preventing Client Calls to a Server-Only Method

### DOES NOT WORK WITH METEOR 1.5.1+

Fair warning, due to change in the behavior of the `this.connection` technique described below, this will _not_ work with Meteor 1.5.1+. If you're using Meteor 1.5.1+, it's best to avoid calling Meteor Methods from the server directly, and instead, [defining common modules that can be called from within your Methods](https://themeteorchef.com/tutorials/using-the-module-pattern).

---

### Heads Up!
**This snippet was refactored to be a little bit simpler on 01/16/15. Big thanks to
[@richsilvo](http://twitter.com/richsilvo) and [Ben Green](http://crater.io/users/numtel) for suggesting the simplification :)**

----

Technically, Meteor's methods are exposed to the client, meaning any user can determine a method we've written and call it from the client. Sometimes, though, we have server methods that we *do not* want accessible from the client. The following pattern showcases how to prevent client-side method calls by ~~making use of the Random package and a bit of elbow grease~~ checking whether `this.connection == null` inside of our method.

**Note:** Server-only Meteor methods are not necessary since normal server side only functions could be used instead. Using server-only Meteor methods can help provide a few advantages when it comes to code organization, readability and understanding. Method declarations (server-only and non-server-only) can be organized and logically grouped together. `Method.call` references visually stand out in code and imply a certain behavior, making it easier to understand what's happening where.  

#### What we're trying to accomplish

As an example, we have a method called `updateUserName` that we only want accessible on the server. We do *not* want a user (or other bad actor) able to update their name from the client. So, by default if our user called `Meteor.call('updateUserName')` on the client...

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

And our method didn't check to see _where_ the method was called from...

```
Meteor.methods({
  updateUserName: function(update){
    check(update, {id: String, name: String});

    Meteor.users.update(update.id,{
      $set: {
        "profile.name": update.name
      }
    });
  }
});
```

...our method would perform the update. Instead, we want to make sure that our method never allows this to happen.

#### Our Solution
Because `this.connection == null` on the server, we can wrap whatever function our method is trying to perform in an `if` statement testing for this case:

```
Meteor.methods({
  updateUserName: function(update){
    check(update, {id: String, name: String});
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
```

Easy peasy. Now, if we were to call our method from the client (e.g. in our browser's console), Meteor would throw an error because `this.connection` would return a connection object and _not_ null like we want. To test this out, we can setup a `setTimeout()` callback in our `Meteor.startup()` callback to test firing our method directly from the server:

```
Meteor.startup(function(){
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
```

Now, after our server starts up and a five second wait, our method will be called successfully and our user will be updated!

#### Wrap Up
So there we go, a quick pattern for securing methods so that they can only be called from the server! Handy. This was discovered in passing while I was working on Recipe #5, Building a SaaS with Meteor: Stripe where I'll be showcasing how to integrate Stripe in a Meteor app. If you want to see it in action, make sure to [sign up for the mailing list](http://themeteorchef.us8.list-manage2.com/subscribe?u=8cffd428bf025d80425da063c&id=a347eecb12). If you have any improvements to this snippet, feel free to share and submit a Pull Request!

Again, big thanks to [@richsilvo](http://twitter.com/richsilvo) and [Ben Green](http://crater.io/users/numtel) for the tip on `this.connection == null`!
