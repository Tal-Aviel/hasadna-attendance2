let app = firebase.app();

let provider = new firebase.auth.GoogleAuthProvider();

let currentUser;

let profile = {};

let fields = ["inputFirstName", "inputLastName", "selectProject", "inputLinkedIn", "inputMAC"];

let loadingDiv = $("<div>").addClass("loading").text("Loading...").appendTo("body");


firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        firebase.auth().signInWithRedirect(provider);
    } else {
        currentUser = user;
        start();
    }
});

function start() {
    $("#spanUserName").text(currentUser.displayName);
    loadProfile();
}

function loadProfile() {
    let uid = currentUser.uid;
    firebase.database().ref("profiles").child(uid).once('value').then(snapshot => {
        loadingDiv.remove();
        if (!snapshot) return;

        profile = snapshot.val() || {};

        fields.forEach(field => {
            $(`#${field}`).val(profile[field]);
        });
    });
}

$("#btnSubmit").click(() => {
    let uid = currentUser.uid;

    let updates = {};
    fields.forEach(field => {
        let val = $(`#${field}`).val();
        if (val) {
            updates[field] = val;
        }
    });

    firebase.database().ref("profiles").child(uid).update(updates).then(() => {
        //<div class="alert alert-success" role="alert">
        let successDiv = $("<div>").addClass("alert alert-success").text("הפרופיל עודכן בהצלחה").hide();
        $("body").append(successDiv);
        successDiv.show(400);
        setTimeout(() => successDiv.hide(400, () => successDiv.remove()), 2000);
    }).catch(e => console.error(e));
});