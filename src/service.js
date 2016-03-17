var ajax = require('ajax');
var Settings = require('settings');


var service = {
  validLoginInfo: validLoginInfo,
  createConfigListenersAndGetTimeEntries: createConfigListenersAndGetTimeEntries,
  createTimer: createTimer,
  getTimeEntries: getTimeEntries,
  toggleTimer: toggleTimer
};


var baseUrl = getBaseUrl();
var configUrl = 'https://bsell93.github.io/pebble-harvest/';
var header = {
  Authorization: Settings.option().authString,
  Accept: 'application/json',
  'Content-Type': 'application/json'
};


function validLoginInfo() {
  if (Settings.option().authString && Settings.option().harvestUrl) {
    return true;
  }
  return false;
}

function createConfigListenersAndGetTimeEntries(successCallback, errorCallback) {
  Settings.config(
    { url: configUrl },
    function(e) {
      console.log('closed configurable: ' + JSON.stringify(e));
      header.Authorization = Settings.option().authString;
      baseUrl = getBaseUrl();
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

function getBaseUrl() {
  return 'https://' + Settings.option().harvestUrl + '.harvestapp.com/';
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