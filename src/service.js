var ajax = require('ajax');


var service = {
  createTimer: createTimer,
  getTimeEntries: getTimeEntries,
  toggleTimer: toggleTimer
};


var authString = 'Basic YnJ5YW50QGpyYmV1dGxlci5jb206amFzbWluZTE=';
var baseUrl = 'https://jrbeutler.harvestapp.com/';
var header = {
  Authorization: authString,
  Accept: 'application/json',
  'Content-Type': 'application/json'
};


function createTimer(projectId, taskId, spentAt, success, error) {
  var data = {
    project_id : projectId,
    task_id : taskId,
    spent_at : spentAt
  };
  
  post('daily/add', data, success, error);
}

function getTimeEntries(success, error) {
  get('daily', success, error);
}

function toggleTimer(dayEntryId, success, error) {
  get('daily/timer/' + dayEntryId, success, error);
}

function get(url, success, error) {
  ajax(
    {
      headers: header,
      url: baseUrl + url
    }, success, error
  );
}

function post(url, data, success, error) {
  ajax(
    {
      data: data,
      headers: header,
      method: 'POST',
      url: baseUrl + url
    }, success, error
  );
}

this.exports = service;