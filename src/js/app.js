/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var clientList = require('clientList');
var service = require('service');
var splash = require('splash');
var taskList = require('taskList');



var forDate = '';
var getDataIntervalTimer = null;


activate();

function activate() {
  service.createConfigListenersAndGetTimeEntries(getTimeEntriesSuccess, error);
  if (service.validLoginInfo()) {
    splash.createAndShowSplash();
    service.getTimeEntries(getTimeEntriesSuccess, error);
  } else {
    splash.createCredentialSplash('Enter Harvest credentials in the settings of the app.');
  }
}

function createMainListListeners() {
  clientList.view.on('select', function(e) {
    var entry = {};
    switch(e.sectionIndex) {
      case 0:
        for (var i in clientList.dayEntries) {
          if (clientList.dayEntries[i].timer_started_at) {
            entry = clientList.dayEntries[i];
          }
        }
        toggleOrCreateTimer(entry.project_id, entry.task_id);
        break;
      case 1:
        entry = clientList.dayEntries[e.itemIndex];
        toggleOrCreateTimer(entry.project_id, entry.task_id);
        break;
      default:
        var project = clientList.projects[e.itemIndex];
        taskList.showTasks(project, clientList.dayEntries);
        createTaskListeners(project);
    }
  });
}

function createTaskListeners(project) {
  taskList.view.on('select', function(e) {
    toggleOrCreateTimer(project.id, project.tasks[e.itemIndex].id);
  });
}

function setUpdateDataInterval() {
  if (!getDataIntervalTimer) {
    getDataIntervalTimer = setInterval(function() {
      service.getTimeEntries(updateDataSuccess, error);
    }, 10000);
  }
}

function toggleOrCreateTimer(projectId, taskId) {
  var called = false;
  for (var i in clientList.dayEntries) {
    var entry = clientList.dayEntries[i];
    if (entry.task_id == taskId && entry.project_id == projectId) {
      service.toggleTimer(entry.id, toggleTimerSuccess, error);
      called = true;
      break;
    }
  }
  if (!called) {
    service.createTimer(projectId, taskId, forDate, createTimerSuccess, error);
  }
}

function updateMenus(dontSelectFirst) {
  clientList.updateMainListTimerSections(!dontSelectFirst);
  taskList.updateTaskList(clientList.projects, clientList.dayEntries);
}

// REGION: Service functions
function createTimerSuccess(data) {
  data = JSON.parse(data);
  for (var i in clientList.dayEntries) {
    var entry = clientList.dayEntries[i];
    if (data.project_id != entry.project_id || data.task_id != entry.task_id) {
      clientList.dayEntries.push(data);
      break;
    }
  }
  if (clientList.dayEntries.length === 0) {
    clientList.dayEntries.push(data);
  }
  updateMenus(data.project_id);
}

function getTimeEntriesSuccess(data) {
  splash.hide();
  
  data = JSON.parse(data);
  forDate = data.for_day;
  clientList.dayEntries = data.day_entries;
  clientList.projects = data.projects;
  
  clientList.showClients();
  
  createMainListListeners();
  
  setUpdateDataInterval();
}

function toggleTimerSuccess(data) {
  data = JSON.parse(data);
  for (var i in clientList.dayEntries) {
    var entry = clientList.dayEntries[i];
    if (data.project_id == entry.project_id && data.task_id == entry.task_id) {
      clientList.dayEntries[i] = data;
    }
  }
  updateMenus(data.project_id);
}

function updateDataSuccess(data) {
  data = JSON.parse(data);
  forDate = data.for_day;
  clientList.dayEntries = data.day_entries;
  clientList.projects = data.projects;
  
  updateMenus(true);
}

function error(error) {
  console.log('Error!!! ' + error);
}
// ENDREGION: Service functions