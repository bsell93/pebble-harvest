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
  var rememberMe = $('#rememberMe');
  var harvestUrl = $('#harvestUrl');
  var email = $('#email');
  var password = $('#password');

  if (localStorage.rememberMe) {
    rememberMe[0].checked = localStorage.rememberMe;
    if (localStorage.harvestUrl) {
      harvestUrl[0].value = localStorage.harvestUrl;
    }
    if (localStorage.email) {
      email[0].value = atob(localStorage.email);
    }
    if (localStorage.password) {
      password[0].value = atob(localStorage.password);
    }
  }
}

function getAndStoreConfigData() {
  var rememberMe = $('#rememberMe');
  var harvestUrl = $('#harvestUrl');
  var email = $('#email');
  var password = $('#password');

  var options = {
    authString: 'Basic ' + btoa(email.val() + ':' + password.val()),
    harvestUrl: harvestUrl.val()
  };

  if (rememberMe[0].checked) {
    localStorage.rememberMe = rememberMe[0].checked;
    localStorage.harvestUrl = harvestUrl.val();
    localStorage.email = btoa(email.val());
    localStorage.password = btoa(password.val());
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