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

var dayEntries = [];
var projects = [];
var clientList, splashWindow, taskList;


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

function getTimeEntries() {
  ajax(
    {
      headers: header,
      url: 'https://jrbeutler.harvestapp.com/daily/70/2016'
    },
    function(data) {
      data = JSON.parse(data);
      dayEntries = data.day_entries;
      projects = data.projects;
      showClients();
    },
    function(error) {
      console.log('Error!!! ' + error);
    }
  );
}

function showClients() {
  clientList = new UI.Menu({
    sections: [{
      title: 'Clients',
      items: createListItems(projects, 'client')
    }]
  }).show();
  splashWindow.hide();
  
  createClientListListeners();
}

function showTasks(projectIndex) {
  taskList = new UI.Menu({
    sections: [{
      title: 'Tasks',
      items: getTaskListAndTime(projectIndex)
    }]
  }).show();
  
  createTaskListeners(projectIndex);
}

function getTaskListAndTime(projectIndex) {
  var items = [];
  var project = projects[projectIndex];
  for (var i in project.tasks) {
    var task = project.tasks[i];
    var time = null;
    for (var idx in dayEntries) {
      var entry = dayEntries[idx];
      if (entry.task_id == task.id && entry.project_id == project.id) {
        time = dayEntries[idx].hours;
      }
    }
    items.push({
      title: task.name,
      subtitle: time
    });
  }
  return items;
}

function createTaskListeners(projectIndex) {
  taskList.on('select', function(e) {
    var project = projects[projectIndex];
    toggleTimer(project.id, project.tasks[e.itemIndex].id);
  });
}

function toggleTimer(projectId, taskId) {
  for (var i in dayEntries) {
      var entry = dayEntries[i];
      if (entry.task_id == taskId && entry.project_id == projectId) {
        toggleTimerRequest(entry.id);
      }
  }
}

function toggleTimerRequest(dayEntryId) {
  ajax(
    {
      headers: header,
      url: 'https://jrbeutler.harvestapp.com/daily/timer/' + dayEntryId
    },
    function(data) {
      console.log(data);
    },
    function(error) {
      console.log('Error!!! ' + error);
    }
  );
}

function createClientListListeners() {
  clientList.on('select', function(e) {
    showTasks(e.itemIndex);
  });
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