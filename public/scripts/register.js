(function () {
    let loadingDiv = $("#loading");

    let currentUser;

    let profile = {};

    let fields = ["firstName", "lastName", "project", "linkedin"];

    function normalize(token) {
        return token.replace(/\./g, ",");
    }

    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            $("#bs-example-navbar-collapse-1").remove();
            loadingDiv.remove();
        } else {
            $('#btnSubmit').text('עדכן');
            currentUser = user;
            $("#usergroup").remove();
            $("#passwordgroup").remove();
            start();
        }
    });

    function start() {
        console.log(currentUser);
        $("#spanUserName").text(currentUser.email);
        loadProfile();
    }

    function loadProfile() {
        firebase.database().ref("users").child(normalize(currentUser.email)).child('profile').once('value').then(snapshot => {
            loadingDiv.remove();
            if (!snapshot) return;

            profile = snapshot.val() || {};

            fields.forEach(field => {
                $(`#${field}`).val(profile[field]);
            });
        });
    }

    $("#frm").submit(() => {
        try {
            let updates = {};
            fields.forEach(field => {
                let val = $(`#${field}`).val();
                if (val) {
                    updates[field] = val;
                }
            });
            let email, fbuser;
            if (currentUser) {
                fbuser = Promise.resolve({uid: currentUser.uid});
                email = currentUser.email;
            } else {
                let password = $("#password").val();
                email = $("#username").val();
                fbuser = firebase.auth().createUserWithEmailAndPassword(email, password);
            }

            fbuser.then(user => {
                console.log(user);
                let uid = user.uid;
                return firebase.database().ref("users").child(normalize(email)).update({
                    profile: updates,
                    uid: uid
                });
            }).then(() => {
                alert('הפרטים נקלטו בהצלחה');
                window.location = 'index.html';
            }).catch(e => {
                console.error(e);
                alert('Registration failed: ' + e);
            });
        } catch (e) {
            console.error(e);
        }
        return false;
    });

    $("#logout").click(() => {
        firebase.auth().signOut().then(() => {
            window.location = 'index.html';
        }).catch(e => alert(e));
    });
})();