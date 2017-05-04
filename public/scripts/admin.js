let app = firebase.app();

let provider = new firebase.auth.GoogleAuthProvider();

let currentUser;

//let loadingDiv = $("<div>").addClass("loading").text("Loading...").appendTo("body");


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

    firebase.database().ref("profiles").once('value').then(snapshot => {
        let users = (snapshot || {}).val();
        if (!users) return;
        let source = [];
        for (let uid in users) {
            let user = users[uid];
            source.push(`${user.inputFirstName} ${user.inputLastName}`);
        }


        function split(val) {
            return val.split(/,\s*/);
        }

        function extractLast(term) {
            return split(term).pop();
        }

        $("#attendees")
            .on("keydown", function (event) {
                if (event.keyCode === $.ui.keyCode.TAB &&
                    $(this).autocomplete("instance").menu.active) {
                    event.preventDefault();
                }
            })
            .autocomplete({
                minLength: 0,
                source: function (request, response) {
                    // delegate back to autocomplete, but extract the last term
                    response($.ui.autocomplete.filter(
                        source, extractLast(request.term)));
                },
                focus: function () {
                    // prevent value inserted on focus
                    return false;
                },
                select: function (event, ui) {
                    let terms = split(this.value);
                    // remove the current input
                    terms.pop();
                    // add the selected item
                    if (terms.indexOf(ui.item.value) === -1) {
                        terms.push(ui.item.value);
                    }
                    // add placeholder to get the comma-and-space at the end
                    terms.push("");
                    this.value = terms.join(", ");
                    return false;
                }
            });


    }).catch(e => console.error(e));
}

$("#btnSubmit").click(() => {
    let date = $("#datepicker").val();
    let attendees = $("#attendees").val().split(",");
    attendees.pop();
    attendees = attendees.map(a => a.trim());
    firebase.database().ref('attendance').child(date).set(attendees).then(() => console.log('Done!')).catch(e => console.error(e));
});

$("#datepicker").datepicker({
    dateFormat: 'dd-mm-yy',
    onSelect: val => {
        firebase.database().ref('attendance').child(val).once('value').then(snapshot => {
            let users = (snapshot || {}).val();
            if(!users) {
                return $("#attendees").val("");
            }
            users.push("");
            let usersString = users.join(", ");
            $("#attendees").val(usersString);
        });
    }
});