// File definition
var timeFormatter = {
  getCurrentTimerSubtitle: getCurrentTimerSubtitle,
  getTimeString: getTimeString
};
this.exports = timeFormatter;


// File definition
function getCurrentTimerSubtitle(entry) {
  return getTimeString(entry.hours) + ', ' + entry.task;
}

function getTimeString(hourValue) {
  hourValue = parseFloat(hourValue, 10);
  var seconds = hourValue * 3600;
  var hours = Math.floor(hourValue);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  return (hours + ':' + minutes) || '';
}