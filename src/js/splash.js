var Feature = require('platform/feature');
var UI = require('ui');
var Vector2 = require('vector2');


var splash = {
  createAndShowSplash: createAndShowSplash,
  createCredentialSplash: createCredentialSplash,
  hide: hide,
  spinnerInterval: null,
  view: null
};
this.exports = splash;



function createAndShowSplash() {
  // Show splash screen while waiting for data
  splash.view = new UI.Window({
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
  splash.view.add(text).add(spinner).show();
  
  createSpinnerAnimation(spinner);
}

function createCredentialSplash(message) {
  splash.view = new UI.Window({
    backgroundColor: 'white'
  });
  
  var res = Feature.resolution();
  
  var text = new UI.Text({
    color: 'black',
    font: 'BITHAM_42_BOLD',
    position: new Vector2(0, 0),
    size: new Vector2(res.x, res.y),
    text: message,
    textAlign: 'center'
  });
  
  splash.view.add(text).show();
}

function createSpinnerAnimation(spinner) {
  var angle = 0;
  var angle2 = 0;
  var changeRotationCount = 0;
  var changeRotation = 1;
  splash.spinnerInterval = setInterval(function() {
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

function hide() {
  clearInterval(splash.spinnerInterval);
  splash.view.hide();
}