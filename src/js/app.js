/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var clientList = require('clientList');
var Feature = require('platform/feature');
var service = require('service');
var taskList = require('taskList');
var UI = require('ui');
var Vector2 = require('vector2');



var forDate = '';
var getDataIntervalTimer = null;
var splashWindow;
var spinnerInterval;


activate();

function activate() {
  service.createConfigListenersAndGetTimeEntries(getTimeEntriesSuccess, error);
  var textTitle = 'Downloading client data...';
  if (service.validLoginInfo()) {
    service.getTimeEntries(getTimeEntriesSuccess, error);
  } else {
    textTitle = 'Enter Harvest credentials in the settings of the app.';
  }
  createAndShowSplash(textTitle);
}

function createAndShowSplash(textTitle) {
  // Show splash screen while waiting for data
  splashWindow = new UI.Window({
    backgroundColor: 'white'
  });
  
  var res = Feature.resolution();

  // Text element to inform user
  var text = new UI.Text({
    color: 'black',
    font: 'BITHAM_42_BOLD',
    position: new Vector2(0, (res.y/2) - 25),
    size: new Vector2(res.x, 50),
    text: 'H',
    textAlign: 'center'
  });
  
  var spinnerX = res.x * 0.90;
  var spinnerY = res.y * 0.90;
  var spinner = new UI.Radial({
    borderWidth: 5,
    borderColor: 'blue',
    position: new Vector2((res.x/2) - (spinnerX/2), (res.y/2) - (spinnerY/2)),
    radius: 2,
    size: new Vector2(spinnerX, spinnerY)
  });

  // Add to splashWindow and show
  splashWindow.add(text).add(spinner).show();
  
  createSpinnerAnimation(spinner);
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

function createSpinnerAnimation(spinner) {
  var angle = 0;
  var angle2 = 0;
  var changeRotationCount = 0;
  var changeRotation = 1;
  spinnerInterval = setInterval(function() {
    if ((angle >= 360 && changeRotation === 1) || (angle <= -360 && changeRotation === -1)) {
      angle = 0;
      changeRotationCount++;
      if (changeRotationCount >= 3) {
        changeRotation = changeRotation === 1 ? -1 : 1;
        changeRotationCount = 0;
      }
    }
    angle2 = angle + 90;
    spinner.angle(angle);
    spinner.angle2(angle2);
    angle += 5 * changeRotation;
  }, 10);
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
  clearInterval(spinnerInterval);
  data = JSON.parse(data);
  forDate = data.for_day;
  clientList.dayEntries = data.day_entries;
  clientList.projects = data.projects;
  
  clientList.showClients();
  
  splashWindow.hide();
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