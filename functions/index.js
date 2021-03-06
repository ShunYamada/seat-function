const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

admin.initializeApp(functions.config().firebase);

// deal push notification

exports.dealPush = functions.database.ref('/deals/{dealId}')
.onWrite(event => {
  const item = event.data;
  const ownerId = item.child("ownerId").val();
  const payload = {
    notification: {
      body: "Your seat has been purchased",
      badge: "1",
      sound: "default"
    }
  };

  getTargetFcmToken(ownerId, function(token) {
    pushToDevice(token, payload);
  });
});

var getTargetFcmToken = function(ownerId, callback) {
  admin.database().ref(`/users/${ownerId}`)
  .once('value', snapshot => {
    console.log('Valu', snapshot.val());
    const token = snapshot.val().pushToken;

    if(token == null) {
      console.log("Nothing token");
      return
    }
    console.log("return callback token", token);

    callback(token);
  });
}

function pushToDevice(token, payload) {
  console.log("pushToDevise:", token);

  const options = {
    priority: "high",
  };

  admin.messaging().sendToDevice(token, payload, options)
  .then(pushResponse => {
    console.log("Successfully sent message:", pushResponse);
  })
  .catch(error => {
    console.log("Error sending message:", error);
  });
}

// review push notification

exports.reviewPush = functions.database.ref('/reviews/{reviewId}')
.onWrite(event => {
  const item = event.data;
  const reviewedId = item.child("reviewed").val();
  const payload = {
    notification: {
      body: "You have been reviewd by someone",
      badge: "1",
      sound: "default"
    }
  };

  getTargetFcmToken(reviewedId, function(token) {
    pushToDevice(token, payload);
  });
});

var getTargetFcmToken = function(reviewedId, callback) {
  admin.database().ref(`/users/${reviewedId}`)
  .once('value', snapshot => {
    console.log('Valu', snapshot.val());
    const token = snapshot.val().pushToken;

    if(token == null) {
      console.log("Nothing token");
      return
    }
    console.log("return callback token", token);

    callback(token);
  });
}

function pushToDevice(token, payload) {
  console.log("pushToDevise:", token);

  const options = {
    priority: "high",
  };

  admin.messaging().sendToDevice(token, payload, options)
  .then(pushResponse => {
    console.log("Successfully sent message:", pushResponse);
  })
  .catch(error => {
    console.log("Error sending message:", error);
  });
}

// message push notification

exports.messagePush = functions.database.ref('/rooms/{roomId}/messages/{messageId}')
.onWrite(event => {
  const item = event.data;
  const userId = item.child("user").child("uid").val();
  const userName = item.child("user").child("name").val();
  const message = item.child("text").val();

  roomRef = item.ref.parent.parent
  roomRef.once('value').then(function(snapshot){
    const payload = {
      notification: {
        body: userName + ": " + message,
        badge: "1",
        sound: "default"
      }
    };

    const users = snapshot.val().users
    console.log("Successfully fetch members:", users);

    for (key in users) {
      console.log("Successfully fetch member:", users[key]);

      const receivedId = users[key].uid

      if (uid = userId) {
        continue;
      }

      getMessageFcmToken(receivedId, function(token) {
        pushToDevice(token, payload);
      });
    }
  });

  var getMessageFcmToken = function(receivedId, callback) {
    admin.database().ref(`/users/${receivedId}`)
    .once('value', snapshot => {
      console.log('Valu', snapshot.val());
      const token = snapshot.val().pushToken;

      if(token == null) {
        console.log("Nothing token");
        return
      }
      console.log("return callback token", token);

      callback(token);
    });
  }

  function pushToDevice(token, payload) {
    console.log("pushToDevise:", token);

    const options = {
      priority: "high",
    };

    admin.messaging().sendToDevice(token, payload, options)
    .then(pushResponse => {
      console.log("Successfully sent message:", pushResponse);
    })
    .catch(error => {
      console.log("Error sending message:", error);
    });
  }
});
