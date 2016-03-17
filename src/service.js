var ajax = require('ajax');
var Settings = require('settings');


var service = {
  authStringExists: authStringExists,
  createConfigListenersAndGetTimeEntries: createConfigListenersAndGetTimeEntries,
  createTimer: createTimer,
  getTimeEntries: getTimeEntries,
  toggleTimer: toggleTimer
};


var baseUrl = 'https://jrbeutler.harvestapp.com/';
var configUrl = 'http://10.101.200.85/pebble-harvest/';
var header = {
  Authorization: Settings.option().authString,
  Accept: 'application/json',
  'Content-Type': 'application/json'
};


function authStringExists() {
  if (Settings.option().authString) {
    return true;
  }
  return false;
}

function createConfigListenersAndGetTimeEntries(successCallback, errorCallback) {
  Settings.config(
    { url: configUrl },
    function(e) {
      console.log('closed configurable: '  JSON.stringify(e));
      header.Authorization = Settings.option().authString;
      getTimeEntries(successCallback, errorCallback);
    }
  );
}

function createTimer(projectId, taskId, spentAt, success, error) {
  var data = {
    project_id: projectId,
    task_id: taskId,
    spent_at: spentAt
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