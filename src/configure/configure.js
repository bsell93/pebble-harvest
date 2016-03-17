(function() {
  loadOptions();
  loginHandler();
})();

function loginHandler() {
  var loginButton = $('#loginButton');

  loginButton.on('click', function() {

    var return_to = getQueryParam('return_to', 'pebblejs://close#');
    document.location = return_to + encodeURIComponent(JSON.stringify(getAndStoreConfigData()));
  });
}

function loadOptions() {
  var email = $('#email');
  var password = $('#password');
  var rememberMe = $('#rememberMe');

  if (localStorage.rememberMe) {
    rememberMe[0].checked = localStorage.rememberMe;
    if (localStorage.email) {
      email[0].value = atob(localStorage.email);
    }
    if (localStorage.password) {
      password[0].value = atob(localStorage.password);
    }
  }
}

function getAndStoreConfigData() {
  var email = $('#email');
  var password = $('#password');
  var rememberMe = $('#rememberMe');

  var options = {
    authString: 'Basic ' + btoa(email.val() + ':' + password.val())
  };

  if (rememberMe[0].checked) {
    localStorage.email = btoa(email.val());
    localStorage.password = btoa(password.val());
    localStorage.rememberMe = rememberMe[0].checked;
  } else {
    localStorage.clear();
  }

  return options;
}

function getQueryParam(variable, defaultValue) {
  var query = location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return defaultValue || false;
}