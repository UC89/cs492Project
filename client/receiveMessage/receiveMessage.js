
console.log('on receive message page!');

Template.receiveMessage.onRendered(function() {

  var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {

  // First get ahold of getUserMedia, if present
  var getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia);

  // Some browsers just don't implement it - return a rejected promise with an error
  // to keep a consistent interface
  if(!getUserMedia) {
    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
  }

  // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
  return new Promise(function(successCallback, errorCallback) {
    getUserMedia.call(navigator, constraints, successCallback, errorCallback);
  });

  }

  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if(navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if(navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
  }


  // Prefer camera resolution nearest to 1280x720.
  var constraints = { audio: false, video: { width: 1280, height: 720 } };

  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    var video = document.querySelector('#faceVideo');
    video.src = window.URL.createObjectURL(stream);
    console.log('Video url: '+video.src);
    video.onloadedmetadata = function(e) {
      video.play();
    };
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });

  //Facial detection

  //This is what goes into prime generator
  var faceMeasurements = [];


  var canvas = document.querySelector('#faceCanvas');
  var context = canvas.getContext('2d');
  var objects = new tracking.ObjectTracker(['eye']);
  objects.setInitialScale(4);
  objects.setStepSize(2);
  objects.setEdgesDensity(0.1);

  //var ctracker = new clm.tracker();

  objects.on('track', function(event) {
  if (event.data.length === 0) {
    // No objects were detected in this frame.
  }
  else if (event.data.length === 2) {
    console.log("FOUND 2 EYES!!!!!");
    context.clearRect(0, 0, canvas.width, canvas.height);
    event.data.forEach(function(rect) {
      console.log(rect.x)
      detection = event.data;


      context.strokeStyle = '#a64ceb';
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.font = '11px Helvetica';
      context.fillStyle = "#fff";
      context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
      context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    });
  }
  else {
      console.log("Sorry, you need another Eye!");
  }
  //console.log("Is Prime: "+isPrime(9));
});

//Not in events because trackerTask object is local to onRendered
var trackerTask = tracking.track('#faceVideo', objects);
  //var ctracker = new clm.tracker();
  //ctracker.init(pModel);
  //ctracker.start(video);
  $( "#startTracker" ).click(function() {
    console.log('Clicked Decrypt: ')
    trackerTask.run();
    console.log('Stop trackerTask');
    console.log('Type: '+typeof trackerTask);
  });
  $( "#endTracker" ).click(function() {
    console.log('endTracker: ')
    trackerTask.stop();
    //console.log("DetectionObject : "+detection);
  });
  $( "#decryptButton" ).click(function() {
    console.log('Clicked Decrypt: ')
    console.log("DetectionObject : "+detection);
    if (detection.length < 2) {
      console.log("Try again");
      alert("Try again");
    }
    console.log("Detection 1: "+detection[0].x+" Eye 2: "+detection[1].width)
    $('#messageContents').attr('value','Attempt to decrypt');
    primes = getFacePrimes(detection);

  });
});


function isPrime(n) {
 if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false;
 if (n%2==0) return (n==2);
 if (n%3==0) return (n==3);
 var m=Math.sqrt(n);
 for (var i=5;i<=m;i+=6) {
  if (n%i==0)     return false;
  if (n%(i+2)==0) return false;
 }
 return true;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getFacePrimes(faceMeasurements) {
  var primesFound = false;
  var seed = Math.round(faceMeasurements[0].x - faceMeasurements[1].x);
  seed = Math.pow(seed,2);

  var firstPrimeFound=false;
  var secondPrimeFound=false;
  var primeArray = [0,0];
  while (primesFound ===false) {
    while (firstPrimeFound ==false) {
      if (isPrime(seed)) {
        primeArray[0]=seed;
        firstPrimeFound=true;
        seed+=1
      }
      else if(seed%2 == 0) {
        seed+=1;
      }
      else if(!isPrime(seed)) {
        seed+=2;
      }
    }
    while (firstPrimeFound ==true && secondPrimeFound==false) {
      if (isPrime(seed)) {
        primeArray[1]=seed;
        secondPrimeFound=true;
        primesFound = true;
      }
      else if(seed%2 == 0) {
        seed+=1;
      }
      else if(!isPrime(seed)) {
        seed+=2;
      }

    }
  }
  console.log("Returning prime array: "+primeArray);
  return primeArray;
}



