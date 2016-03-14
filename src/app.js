/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');

var authString = 'Basic YnJ5YW50QGpyYmV1dGxlci5jb206amFzbWluZTE=';

var header = {
        Authorization: authString,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      };

var projects = [];
var splashWindow;


activate();

function activate() {
  createAndShowSplash();
}

function createAndShowSplash() {
  // Show splash screen while waiting for data
  splashWindow = new UI.Window();
  
  // Text element to inform user
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text:'Downloading client data...',
    font:'GOTHIC_28_BOLD',
    color:'black',
    textOverflow:'wrap',
    textAlign:'center',
    backgroundColor:'white'
  });
  
  // Add to splashWindow and show
  splashWindow.add(text).show();
  
  getTimeEntries();
}

function login() {
  ajax(
    {
      headers: header,
      url: 'https://jrbeutler.harvestapp.com/account/who_am_i'
    },
    function(data) {
      data = JSON.parse(data);
      getTimeEntries();
    },
    function(error) {
      console.log('Error!!! ' + error);
    }
  );
}

function getTimeEntries() {
  ajax(
    {
      headers: header,
      url: 'https://jrbeutler.harvestapp.com/daily'
    },
    function(data) {
      data = JSON.parse(data);
      projects = data.projects;
      showClients();
    },
    function(error) {
      console.log('Error!!! ' + error);
    }
  );
}

function showClients() {
  new UI.Menu({
    sections: [{
      title: 'Clients',
      items: createListItems(projects, 'client')
    }]
  }).show();
  splashWindow.hide();
}

function createListItems(arrayOfItems, titleProperty) {
  var items = [];
  for (var i in arrayOfItems) {
    items.push({
      title: arrayOfItems[i][titleProperty]
    });
  }
  return items;
}