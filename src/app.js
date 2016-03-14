/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var service = require('service');
var UI = require('ui');
var Vector2 = require('vector2');

var forDate = "";
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
  
  service.getTimeEntries(getTimeEntriesSuccess, error);
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

function createTaskListeners(projectIndex) {
  taskList.on('select', function(e) {
    var project = projects[projectIndex];
    toggleOrCreateTimer(project.id, project.tasks[e.itemIndex].id);
  });
}

function getTaskListAndTime(projectIndex) {
  var items = [];
  var project = projects[projectIndex];
  for (var i in project.tasks) {
    var task = project.tasks[i];
    var time = null;
    var icon = '';
    for (var idx in dayEntries) {
      var entry = dayEntries[idx];
      if (entry.task_id == task.id && entry.project_id == project.id) {
        time = dayEntries[idx].hours;
        if (entry.timer_started_at) {
          icon = 'images/timer.png';
        }
      }
    }
    items.push({
      title: task.name,
      subtitle: time,
      icon: icon
    });
  }
  return items;
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
    highlightBackgroundColor: 'blue',
    sections: [{
      title: 'Tasks',
      items: getTaskListAndTime(projectIndex)
    }]
  }).show();
  
  createTaskListeners(projectIndex);
}

function toggleOrCreateTimer(projectId, taskId) {
  var called = false;
  for (var i in dayEntries) {
      var entry = dayEntries[i];
      if (entry.task_id == taskId && entry.project_id == projectId) {
        service.toggleTimer(entry.id, null, error);
        called = true;
      }
  }
  if (!called) {
    service.createTimer(projectId, taskId, forDate, createTimerSuccess, error);
  }
}

// REGION: Service functions
function createTimerSuccess(data) {
  data = JSON.parse(data);
  for (var i in dayEntries) {
    if (data.project_id != dayEntries[i].project_id && data.task_id != dayEntries[i].task_id) {
      dayEntries.push(data);
    }
  }
  if (dayEntries.length === 0) {
    dayEntries.push(data);
  }
}

function getTimeEntriesSuccess(data) {
  data = JSON.parse(data);
  forDate = data.for_day;
  dayEntries = data.day_entries;
  projects = data.projects;
  showClients();
}

function error(error) {
  console.log('Error!!! ' + error);
}
// ENDREGION: Service functions