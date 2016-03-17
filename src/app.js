/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var service = require('service');
var UI = require('ui');
var Vector2 = require('vector2');

var timerImage = 'images/timer.png';
var timerWhiteImage = 'images/timer_white.png';

var forDate = '';
var dayEntries = [];
var projects = [];
var clientList, splashWindow, taskList;


activate();

function activate() {
  service.createConfigListenersAndGetTimeEntries(getTimeEntriesSuccess, error);
  var textTitle = 'Downloading client data...';
  if (service.validLoginInfo()) {
    service.getTimeEntries(getTimeEntriesSuccess, error);
  } else {
    textTitle = 'Login in the settings of the app first.';
  }
  createAndShowSplash(textTitle);
}

function createAndShowSplash(textTitle) {
  // Show splash screen while waiting for data
  splashWindow = new UI.Window();

  // Text element to inform user
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: textTitle,
    font: 'GOTHIC_28_BOLD',
    color: 'black',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'white'
  });

  // Add to splashWindow and show
  splashWindow.add(text).show();
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
    toggleOrCreateTimer(project.id, project.tasks[e.itemIndex].id, e.itemIndex);
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
        time = dayEntries[idx].hours.toString();
        if (entry.timer_started_at) {
          icon = timerImage;
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
    highlightBackgroundColor: 'blue',
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

// function taskMenuSelectCallback(e) {
//   console.log(e);
//   var items = taskList.items(0);
//   for (var i in items) {
//     if (items[i].icon == timerWhiteImage && items[i] != e.item) {
//       items[i].icon = timerImage;
//     } else if (e.item.icon == timerImage) {
//       e.item.icon = timerWhiteImage;
//     }
//   }
// }

function toggleOrCreateTimer(projectId, taskId, taskIndex) {
  var called = false;
  var taskItem = taskList.item(0, taskIndex);
  for (var i in dayEntries) {
    var entry = dayEntries[i];
    if (entry.task_id == taskId && entry.project_id == projectId) {
      taskItem.icon = entry.timer_started_at ? '' : timerWhiteImage;
      service.toggleTimer(entry.id, toggleTimerSuccess, error);
      called = true;
    }
  }
  if (!called) {
    taskItem.icon = timerWhiteImage;
    service.createTimer(projectId, taskId, forDate, createTimerSuccess, error);
  }
  taskList.item(0, taskIndex, taskItem);
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

function toggleTimerSuccess(data) {
  data = JSON.parse(data);
  for (var i in dayEntries) {
    if (data.project_id == dayEntries[i].project_id && data.task_id == dayEntries[i].task_id) {
      dayEntries[i] = data;
    }
  }
}

function error(error) {
  console.log('Error!!! ' + error);
}
// ENDREGION: Service functions