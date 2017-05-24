(function () {
    let loadingDiv = $("#loading");

    let currentUser;

    function normalize(token) {
        return token.replace(/\./g, ",");
    }

    $("#logout").click(() => {
        firebase.auth().signOut();
    });


    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            window.location = 'login.html';
        } else {
            currentUser = user;
            start();
            loadingDiv.remove();
        }
    });

    function start() {
        console.log(currentUser);
        $("#spanUserName").text(currentUser.email);
        loadStats();
    }

    function loadStats() {
        let userEmailKey = normalize(currentUser.email);
        firebase.database().ref('/users').child(userEmailKey).child('attended').once('value').then(snapshot => {
            let s = snapshot.val();
            if (!s) return;
            let dates = Object.keys(s);
            let currentMonth = (new Date().getMonth());
            let monthCount = 0;
            let latest;
            for (let i = 0; i < dates.length; i++) {
                let date = new Date(dates[i]);
                if (!latest || latest < date) {
                    latest = date;
                }
                if (date.getMonth() == currentMonth) {
                    monthCount++;
                }
            }
            $('#monthAttendance').text(monthCount);
            if (latest) {
                $('#lastAttendance').text(latest.toDateString());
            }
        });
    }

    $("#attend").click(() => {
        var d = new Date();
        let userEmailKey = normalize(currentUser.email);
        if (d.getHours < 15) {
            var dateDateString = (d.getMonth() + 1) + '-' + d.getDate() - 1 + '-' + d.getFullYear();
        } else {
            var dateDateString = (d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getFullYear();
        }
        var dateJSONString = d.toJSON();
        var updateObject = {};
        updateObject['/users/' + userEmailKey + '/attended/' + dateDateString] = dateJSONString;
        updateObject['/attendance/' + dateDateString + '/' + userEmailKey] = dateJSONString;
        firebase.database().ref().update(updateObject).then(() => {
            alert('עודכן!');
        }).catch(e => {
            alert(e);
        });
    });

    $('#update-profile').click(() => {
        window.location = 'register.html';
    });
})();