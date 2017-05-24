(function () {
    let provider = new firebase.auth.GoogleAuthProvider();

    let loadingDiv = $("#loading");

    firebase.auth().getRedirectResult().then(result => {
        if (result.user) {
            // logged in, redirect to index.html
            redirectToIndex();
        } else {
            loadingDiv.remove();
        }
    }).catch(e => {
        loadingDiv.remove();
        console.error(e);
    });

    $("#google-signin").click(() => {
        firebase.auth().signInWithRedirect(provider);
    });

    $("#btnSubmit").click(() => {
        let email = $("#username").val();
        let password = $("#password").val();

        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            redirectToIndex();
        }).catch(error => {
            var errorMessage = error.message;
            alert('Error! ' + errorMessage);
        });
    });

    function redirectToIndex() {
        window.location = 'index.html';
    }

    $('#register').click(() => {
        window.location = 'register.html';
    });
})();