(function () {
    let provider = new firebase.auth.GoogleAuthProvider();

    let currentUser;
    let selectedUsers = [];
    let originalAttendance = [];
    let deletedUsers = [];

    function normalize(token) {
        return token.replace(/\./g, ",");
    }


    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            firebase.auth().signInWithRedirect(provider);
        } else {
            currentUser = user;
            start();
        }
    });

    function renderResult() {
        let r = $('#result').empty();
        selectedUsers.forEach((u, index) => {
            let deleteButton = $("<span>").addClass('glyphicon glyphicon-remove').click(() => {
                if (originalAttendance.indexOf(u) === -1) {
                    selectedUsers.splice(index, 1);
                } else {
                    if (deletedUsers.indexOf(u) === -1) {
                        deletedUsers.push(u);
                    } else {
                        deletedUsers.splice(deletedUsers.indexOf(u), 1);
                    }
                }
                renderResult();
            });
            let userDiv = $('<div>').text(u).appendTo(r).append(deleteButton);
            if (deletedUsers.indexOf(u) !== -1) {
                userDiv.addClass('deleted');
            }
        });
        if (selectedUsers.length === 0) {
            $('<div>').text('אין נוכחים ביום זה').appendTo(r);
        }
    }

    function start() {
        $("#spanUserName").text(currentUser.displayName);

        firebase.database().ref("users").once('value').then(snapshot => {
            let users = (snapshot || {}).val();
            if (!users) return;
            let allUsers = [];
            for (let emailKey in users) {
                let user = users[emailKey].profile;
                let email = emailKey.replace(/,/g, '.');
                allUsers.push(`${user.firstName} ${user.lastName} - ${email}`);
            }

            $("#attendees").autocomplete({
                minLength: 0,
                source: allUsers,
                focus: function () {
                    return false;
                },
                select: function (event, ui) {
                    if (selectedUsers.indexOf(ui.item.value) === -1) {
                        selectedUsers.push(ui.item.value);
                    }
                    renderResult();
                    this.value = '';
                    return false;
                }
            });

        }).catch(e => {
            alert(e);
            window.location='index.html';
        });
    }

    $("#btnSubmit").click(() => {
        let attendanceUpdate = {};
        let usersUpdate = {};
        let date = $("#datepicker").val();
        let dateVal = new Date(date).toJSON();
        let deletePromises = [];
        for (let i = 0; i < selectedUsers.length; i++) {
            let selectedUser = selectedUsers[i];
            let email = normalize(selectedUser.substr(selectedUser.lastIndexOf('-') + 1).trim());
            if (deletedUsers.indexOf(selectedUser) === -1) {
                usersUpdate['/users/' + email + '/attended/' + date] = dateVal;
                attendanceUpdate[email] = dateVal;
            } else {
                deletePromises.push(firebase.database().ref('users').child(email).child('attended').child(date).remove());
            }
        }

        Promise.all([
            firebase.database().ref().update(usersUpdate),
            firebase.database().ref('attendance').child(date).set(attendanceUpdate),
            deletePromises
        ]).then(() => {
            alert('עודכן!');
            selectDate(date);
        }).catch(e => {
            alert(e);
            selectDate(date);
        });
    });

    let map = {};
    let p = firebase.database().ref('users').once('value').then(snapshot => {
        let users = snapshot.val();
        for (let emailKey in users) {
            map[emailKey] = users[emailKey].profile;
        }
        return map;
    });

    $("#datepicker").datepicker({
        dateFormat: 'm-d-yy',
        onSelect: selectDate
    });

    function selectDate(val) {
        p.then(() => {
            firebase.database().ref('attendance').child(val).once('value').then(snapshot => {
                selectedUsers = [];
                deletedUsers = [];
                originalAttendance = [];
                let users = (snapshot || {}).val();
                if (users) {
                    for (let emailKey in users) {
                        let user = map[emailKey];
                        let email = emailKey.replace(/,/g, '.');
                        selectedUsers.push(`${user.firstName} ${user.lastName} - ${email}`);
                        originalAttendance.push(`${user.firstName} ${user.lastName} - ${email}`);
                    }
                }
                renderResult();
            });
        });
    }
})();