var fDB = firebase.database();
var countUp = true;
var originalTime = new Date().getTime();
var timeUsed = 0;
var counting = false;
var myID = null;

function secsToDate(s) {
    let d = new Date(null);
    d.setSeconds(s);
    return d.toISOString().substr(11, 8);
}

function updateTimerValues() {
    // Link with firebase
    let user = fDB.ref(myID);
    user.once('value').then(function(snap) {
        // Set the variables
        if (snap.val()) {
            timeUsed = snap.val().seconds;
            countUp = snap.val().countUp;
            $('.time').text(secsToDate(timeUsed / 1000));
        }
    });
}

function updateDB(value) {
    if (myID) {
        fDB.ref(myID).set({
            seconds: value,
            countUp: countUp
        });
    }
}

$(function() {
    let timerId = null;

    $('#fblogin').on('click', function() {
        if ($(this).text() === 'Facebook') {
            // Login with facebook
            FB.login(fbStatusChange, {scope: 'public_profile'});
        } else {
            // Logout of facebook
            FB.logout(fbStatusChange);
        }
    });

    $('#start').on('click', function() {
        counting = $(this).text() === 'Start';
        $(this).text(counting ? 'Stop' : 'Start');

        if (counting) {
            // Start timer
            originalTime = new Date().getTime();

            timerId = setInterval(function() {
                // Deal exclusively with seconds, but because we might expand,
                // we would store it in the database as milliseconds.
                let currentTime = new Date().getTime();
                let timeDelta = currentTime - originalTime + timeUsed;
                let timeString = secsToDate(timeDelta / 1000);

                // Update the display, and the DB if necessary
                $('.time').text(timeString);
                updateDB(timeDelta);
            }, 1000);

            $('.time').addClass('playing');
            $('#count-down').prop('disabled', true);
            $('#reset').prop('disabled', true);
        } else {
            // Stop timer
            clearInterval(timerId);
            timeUsed += new Date().getTime() - originalTime;

            $('.time').removeClass('playing');
            $('#count-down').prop('disabled', false);
            $('#reset').prop('disabled', false);
        }
    });

    $('#count-down').on('click', function() {
        alert("Work in progress");
    });

    $('#reset').on('click', function() {
        // Resets everything
        originalTime = new Date().getTime();
        timeUsed = 0;
        $('.time').text(secsToDate(0));
        updateDB(0);
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User just signed in
            myID = user.uid;
            updateTimerValues();

            // Add logout button
            $('#firebaseui-auth-container').hide();
            $('#logout').show();
        } else {
            // User just signed out
            // Add logout button
            $('#firebaseui-auth-container').show();
            $('#logout').hide();
        }
    });
});