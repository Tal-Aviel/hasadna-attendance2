let app = firebase.app();

let provider = new firebase.auth.GoogleAuthProvider();

let currentUser;


firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        firebase.auth().signInWithRedirect(provider);
    } else {
        currentUser = user;
        start();
    }
});

function start() {
    console.log(currentUser);
    $("#spanUserName").text(currentUser.displayName);
}

$("#btnSubmit").click(() => {
    let uid = currentUser.uid;

   // Save profile in Firebase
   // firebase.database().ref("profiles").child(uid)
});