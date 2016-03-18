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
var selectedProjectId = null;
var mainList, splashWindow, taskList;


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

function createMainListListeners() {
  mainList.on('select', function(e) {
    var entry = {};
    switch(e.sectionIndex) {
      case 0:
        for (var i in dayEntries) {
          if (dayEntries[i].timer_started_at) {
            entry = dayEntries[i];
          }
        }
        toggleOrCreateTimer(entry.project_id, entry.task_id);
        break;
      case 1:
        entry = dayEntries[e.itemIndex];
        toggleOrCreateTimer(entry.project_id, entry.task_id);
        break;
      default:
        showTasks(e.itemIndex);
    }
  });
}

function createClientListItems(arrayOfItems, titleProperty) {
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

function getCurrentAndRecentTimerItems() {
  var currentItems = [];
  var recentItems = [];
  for (var i in dayEntries) {
    var entry = dayEntries[i];
    var item = {
      title: entry.client,
      subtitle: getCurrentTimerSubtitle(entry)
    };
    if (entry.timer_started_at) {
      item.icon = timerImage;
      currentItems.push(item);
    } else {
      recentItems.push(item);
    }
  }
  return {
    currentTimerItems: currentItems,
    recentTimerItems: recentItems
  };
}

function getCurrentTimerSubtitle(entry) {
  return getTimeString(entry.hours) + ', ' + entry.task;
}

function getTaskListItems(projectIndex) {
  var items = [];
  var project = projects[projectIndex];
  for (var i in project.tasks) {
    var task = project.tasks[i];
    var time = null;
    var icon = '';
    for (var idx in dayEntries) {
      var entry = dayEntries[idx];
      if (entry.task_id == task.id && entry.project_id == project.id) {
        time = getTimeString(dayEntries[idx].hours);
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

function getTaskListTitle(projectIndex) {
  return projects[projectIndex].client + ' Tasks';
}

function getTimeString(hourValue) {
  hourValue = parseFloat(hourValue, 10);
  var seconds = hourValue * 3600;
  var hours = Math.floor(hourValue);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  return hours + ':' + minutes;
}

function setUpdateDataInterval() {
  setInterval(function() {
    service.getTimeEntries(updateDataSuccess, error);
  }, 10000);
}

function showClients() {
  mainList = new UI.Menu({
    highlightBackgroundColor: 'blue',
    sections: [
      { // Current timer
        title: '',
        items: []
      },
      { // Recent timers
        title: '',
        items: []
      },
      {
        title: 'Clients',
        items: createClientListItems(projects, 'client')
      }
    ]
  });

  updateMainListTimerSections();

  mainList.show();
  splashWindow.hide();

  createMainListListeners();
}

function showTasks(projectIndex) {
  selectedProjectId = projects[projectIndex].id;
  taskList = new UI.Menu({
    highlightBackgroundColor: 'blue',
    sections: [{
      title: projects[projectIndex].client + ' Tasks',
      items: getTaskListItems(projectIndex)
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

function toggleOrCreateTimer(projectId, taskId) {
  var called = false;
  for (var i in dayEntries) {
    var entry = dayEntries[i];
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

function updateMainListTimerSections(selectFirst) {
  var timerItemsObject = getCurrentAndRecentTimerItems();
  var currentTimerItems = timerItemsObject.currentTimerItems;
  var currentTimerTitle = currentTimerItems.length > 0 ? 'Current Timer' : '';
  var recentTimerItems = timerItemsObject.recentTimerItems;
  var recentTimerTitle = recentTimerItems.length > 0 ? 'Recent Timers' : '';
  if (recentTimerItems.length == 1) {
    recentTimerTitle = 'Recent Timer';
  }
  var currentTimerSection = {
    title: currentTimerTitle,
    items: currentTimerItems
  };
  var recentTimerSection = {
    title: recentTimerTitle,
    items: recentTimerItems
  };
  mainList.section(0, currentTimerSection);
  mainList.section(1, recentTimerSection);
  if (selectFirst) {
    mainList.selection(0, 0);
  }
}

function updateMenus(projectId, dontSelectFirst) {
  updateMainListTimerSections(!dontSelectFirst);
  updateTaskList(projectId);
}

function updateTaskList(projectId) {
  if (taskList) {
    var projectIndex = null;
    for (var i in projects) {
      if (projects[i].id == projectId) {
        projectIndex = i;
      }
    }
    if (projectIndex) {
      var section = {
        title: getTaskListTitle(projectIndex),
        items: getTaskListItems(projectIndex)
      };
      taskList.section(0, section);
    }
  }
}

// REGION: Service functions
function createTimerSuccess(data) {
  data = JSON.parse(data);
  for (var i in dayEntries) {
    if (data.project_id != dayEntries[i].project_id || data.task_id != dayEntries[i].task_id) {
      dayEntries.push(data);
      break;
    }
  }
  if (dayEntries.length === 0) {
    dayEntries.push(data);
  }
  updateMenus(data.project_id);
}

function getTimeEntriesSuccess(data) {
  data = JSON.parse(data);
  forDate = data.for_day;
  dayEntries = data.day_entries;
  projects = data.projects;
  showClients();
  setUpdateDataInterval();
}

function toggleTimerSuccess(data) {
  data = JSON.parse(data);
  for (var i in dayEntries) {
    if (data.project_id == dayEntries[i].project_id && data.task_id == dayEntries[i].task_id) {
      dayEntries[i] = data;
    }
  }
  updateMenus(data.project_id);
}

function updateDataSuccess(data) {
  data = JSON.parse(data);
  forDate = data.for_day;
  dayEntries = data.day_entries;
  projects = data.projects;
  
  updateMenus(selectedProjectId, true);
}

function error(error) {
  console.log('Error!!! ' + error);
}
// ENDREGION: Service functions