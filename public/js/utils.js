function alertMsg(msg){
    $('#alertMsg').text(msg);
    $('#alertModal').modal('show');
}

function enterKeyHandler(event) {
    if (event.keyCode == 13) {
        $('.enter-target').click();
    }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}