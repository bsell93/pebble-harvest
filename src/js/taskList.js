var UI = require('ui');
var timeFormat = require('timeFormatter');

// File definition
var taskList = {
  selectedProjectId: null,
  showTasks: showTasks,
  updateTaskList: updateTaskList,
  view: null
};
this.exports = taskList;


// File Implementation
var timerImage = 'images/timer.png';


function getTaskListItems(project, dayEntries) {
  var items = [];
  for (var i in project.tasks) {
    var task = project.tasks[i];
    var time = '';
    var icon = '';
    for (var idx in dayEntries) {
      var entry = dayEntries[idx];
      if (entry.task_id == task.id && entry.project_id == project.id) {
        time = timeFormat.getTimeString(entry.hours);
        if (entry.timer_started_at) {
          icon = timerImage;
        }
      }
    }
    if (time === null) {
      time = '';
    }
    items.push({
      title: task.name,
      subtitle: time,
      icon: icon
    });
  }
  return items;
}

function getTaskListTitle(projects, projectIndex) {
  return projects[projectIndex].client + ' Tasks';
}

function showTasks(project, dayEntries) {
  taskList.selectedProjectId = project.id;
  taskList.view = new UI.Menu({
    highlightBackgroundColor: 'blue',
    sections: [{
      title: project.client + ' Tasks',
      items: getTaskListItems(project, dayEntries)
    }]
  }).show();
}

function updateTaskList(projects, dayEntries) {
  if (taskList.view) {
    var projectIndex = null;
    for (var i in projects) {
      if (projects[i].id == taskList.selectedProjectId) {
        projectIndex = i;
      }
    }
    if (projectIndex) {
      var section = {
        title: getTaskListTitle(projects, projectIndex),
        items: getTaskListItems(projects[projectIndex], dayEntries)
      };
      taskList.view.section(0, section);
    }
  }
}