var UI = require('ui');
var timeFormat = require('timeFormatter');

// File definition
var clientList = {
  dayEntries: [],
  projects: [],
  showClients: showClients,
  updateMainListTimerSections: updateMainListTimerSections,
  view: null
};
this.exports = clientList;


// File Implementation
var timerImage = 'images/timer.png';


function createClientListItems(arrayOfItems, titleProperty) {
  var items = [];
  for (var i in arrayOfItems) {
    items.push({
      title: arrayOfItems[i][titleProperty]
    });
  }
  return items;
}

function getCurrentAndRecentTimerItems() {
  var currentItems = [];
  var recentItems = [];
  for (var i in clientList.dayEntries) {
    var entry = clientList.dayEntries[i];
    var item = {
      title: entry.client,
      subtitle: timeFormat.getCurrentTimerSubtitle(entry)
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

function showClients() {
  clientList.view = new UI.Menu({
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
        items: createClientListItems(clientList.projects, 'client')
      }
    ]
  });

  updateMainListTimerSections();

  clientList.view.show();
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
  clientList.view.section(0, currentTimerSection);
  clientList.view.section(1, recentTimerSection);
  if (selectFirst) {
    clientList.view.selection(0, 0);
  }
}