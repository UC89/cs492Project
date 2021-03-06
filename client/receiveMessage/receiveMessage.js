
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
    //var res = String.fromCharCode(72, 69, 76, 76, 79);
    console.log('\n\n\-----------\nClicked Decrypt: ')
    console.log("DetectionObject : "+detection);
    if (detection.length < 2) {
      console.log("Try again");
      alert("Try again");
    }
    var messageId = $('#messageId').text();
    console.log("Message ID: "+messageId);
    var cryptoText = $('textarea#messageContents').val();
    cryptoArray = Messages.find(messageId).fetch();
    console.log("CryptoArray: "+cryptoArray);
    console.log("Crypto 0 : "+cryptoArray[0]);
    console.log("Crypto: "+cryptoArray[0]['messageContentsEncrypted']);

    $('#messageContents').attr ('value','Attempt to decrypt');
    primes = getFacePrimes(detection);
    var decryptMessageOut = decryptMessage(cryptoArray,detection);
    console.log("Decrypted: "+decryptMessageOut)
    $('#messageContents').attr ('value',decryptMessageOut);
    console.log("-----------------------\n\n\n")
  });


  $( "#publicKeyGen" ).click(function() {
    console.log("Generate public key");
    trackerTask.stop();
    if (detection.length < 2) {
      console.log("Try again");
      alert("Try again");
    }
    console.log("Detection 1: "+detection[0].x+" Eye 2: "+detection[1].width)
    $('#messageContents').attr('value','Attempt to decrypt');
    primes = getFacePrimes(detection);
    publicKey = generatePublicKey(primes);
    publicKey = [publicKey[0],publicKey[1]]

    Meteor.call('addPublicKey',publicKey);
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
  var seed = Math.round((faceMeasurements[1].x - faceMeasurements[0].x)/2);
  //Had to change seed, e ended up becoming too big to encrypt message
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

//Public key is stored as e,n
function generatePublicKey(primes) {
  var n = primes[0] * primes[1];
  var totient = (primes[0]-1) * (primes[1]-1);
  e=0;
  var randomPrimeFound = false
  while (!randomPrimeFound) {
    e = getRandomInt(3,totient/4);
    if (isPrime(e)) {
      randomPrimeFound=true;
    }
  }
  console.log("p: "+primes[0]+ "q: "+primes[1]+ " n: "+n+" totient: "+totient + " random: "+e);
  var d = modinv(parseInt(e),parseInt(totient));
  console.log("modular multiplicative inverse: "+d)
  return [e,n,d];

}

function xgcd(e, totient) {

   if (totient == 0) {
     return [1, 0, e];
   }

   temp = xgcd(totient, e % totient);
   x = temp[0];
   y = temp[1];
   d = temp[2];
   return x-y*Math.floor(e/totient);
 }
//http://math.stackexchange.com/questions/67171/calculating-the-modular-multiplicative-inverse-without-all-those-strange-looking
 function modinv(a,m) {
    var v = 1;
    var d = a;
    var u = (a == 1);
    var t = 1-u;
    if (t == 1) {
        var c = m % a;
        u = Math.floor(m/a);
        while (c != 1 && t == 1) {
               var q = Math.floor(d/c);
               d = d % c;
               v = v + q*u;
               t = (d != 1);
               if (t == 1) {
                   q = Math.floor(c/d);
                   c = c % d;
                   u = u + q*v;
               }
        }
        u = v*(1 - t) + t*(m - u);
    }
    return u;
}

//c^d mod n
function decryptMessage(messageArray,faceMeasurements) {
  primes = getFacePrimes(faceMeasurements);
  key = generatePublicKey(primes);
  decryptArrayAscii = []
  decryptArray = []

  var d = key[2];
  var n = key[1];
  for (var i = 0, len = messageArray.length; i < len; i++) {
    decryptArrayAscii.push(Math.pow(messageArray[i],d)%n)
    decryptArray.push(convertAsciiToPlain(decryptArrayAscii[i]))
  }
  console.log("DecryptArray: "+decryptArrayAscii);
  console.log("DecryptPlainArray: "+decryptArray)

  decryptString = decryptArray.join("");
  console.log("Should return: "+decryptString);
  return decryptString;
}

function convertAsciiToPlain(asciiChar) {
  characterReturn = String.fromCharCode(asciiChar%127);
  return characterReturn;
}

