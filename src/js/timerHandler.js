

// File definition
var timerHandler = {
  
};
this.exports = timerHandler;


// File Implementation

function toggleOrCreateTimer(dayEntries, projectId, taskId) {
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