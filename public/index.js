// var localVideo;
// var localStream;
// var remoteStream;
// var uuid;
// var serverConnection;
// var peerConnection ;
// var peerConnectionConfig = {
//     'iceServers': [
//       {'urls': 'stun:stun.stunprotocol.org:3478'},
//       {'urls': 'stun:stun.l.google.com:19302'},
//     ]
//   };
// function openStream (){
//     const config = {
//         'video': true,
//         'audio': true
//     }
//     return navigator.mediaDevices.getUserMedia(config)
// }
// function playStream (idElement,stream){
//     const video = document.getElementById(idElement);
//     video.srcObject = stream ;
//     video.play();
// }
// remoteStream = document.getElementById(RemoteStream);
// function gotIceCandidate(event) {
//     console.log(event);
//     if(event.candidate != null) {
//     //   serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
//         console.log(event);
//     }
// }
// openStream().then(stream=>playStream("localStream",stream));
// serverConnection = io();
// serverConnection.on("connect",()=>{
//     console.log("connect Thành Công");
//     peerConnection = new RTCPeerConnection(peerConnectionConfig);
//     connectionState = peerConnection.connectionState;
//     console.log(connectionState);
//     peerConnection.createOffer(function(offer){
//         peerConnection.setLocalDescription(offer); 
//         serverConnection.emit("offer",offer)
//     },function(error){
//         console.log(error);
//     });
//     peerConnection.ontrack = GotRemoteStream ;
// })
// function GotRemoteStream (event){
//     console.log("on track");
//     remoteStream.srcObject  = event.stream;
// }
var localVideo;
var localStream;
var myName;
var remoteVideo;
var yourConn;
var uuid;
var serverConnection;
var connectionState;
var name; 
var connectedUser;
var peerConnectionConfig = {
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };
  serverConnection = io();
  serverConnection.on("connect",()=>{
      console.log("Connected To server");
  })
  document.getElementById('otherElements').hidden = true;
var usernameInput = document.querySelector('#usernameInput'); 
var usernameShow = document.querySelector('#showLocalUserName'); 
var showAllUsers = document.querySelector('#allUsers');
var remoteUsernameShow = document.querySelector('#showRemoteUserName');
var loginBtn = document.querySelector('#loginBtn');
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn'); 
var hangUpBtn = document.querySelector('#hangUpBtn');

// On Click Login Success
loginBtn.addEventListener("click", function (event) { 
    name = usernameInput.value; 
    usernameShow.innerHTML = "Hello, "+name;
    if (name.length > 0) { 
       send({ 
          type: "login", 
          name: name 
       }); 
    } 
  });
// On Call Event
  callBtn.addEventListener("click", function () {
    console.log('inside call button')
  
    var callToUsername = document.getElementById('callToUsernameInput').value;
      
    if (callToUsername.length > 0) { 
      connectedUser = callToUsername; 
      console.log('nameToCall',connectedUser);
      console.log('create an offer to-',connectedUser)
  
      
      var connectionState2 = yourConn.connectionState;
      console.log('connection state before call beginning',connectionState2)
      var signallingState2 = yourConn.signalingState;
    //console.log('connection state after',connectionState1)
    console.log('signalling state after',signallingState2)
      yourConn.createOffer(function (offer) { 
         send({
            type: "offer", 
            offer: offer 
         }); 
      
         yourConn.setLocalDescription(offer); 
      }, function (error) { 
         alert("Error when creating an offer",error); 
         console.log("Error when creating an offer",error)
      }); 
      document.getElementById('callOngoing').style.display = 'block';
      document.getElementById('callInitiator').style.display = 'none';
  
    } 
    else 
      alert("username can't be blank!")
  });
  // Handler Socket 
  serverConnection.on("message",(data)=>{
    console.log("Got message", data); 
    // var data = JSON.parse(message.data); 
    switch (data.type) {
        case "login":
            handleLogin(data.success,data.allUsers); 
            break;
        case "offer":
            console.log("Có Người Gọi Tới");
            handleOffer(data.offer,data.name)
            break ;
        case "answer":
            console.log(" tra loi user");
            handleAnswer(data.answer);
            break ;
        case "candidate": 
            console.log('inside handle candidate')
            handleCandidate(data.candidate); 
        default:
            break;
    }
  })

  // Hander Login Success
  function handleLogin(success, allUsers){
    if (success === false) { 
        alert("Ooops...try a different username"); 
      } 
      else {
        console.log()
        var allAvailableUsers = allUsers.join();
        console.log('All available users',allAvailableUsers)
        showAllUsers.innerHTML = 'Available users: '+allAvailableUsers;
        localVideo = document.getElementById('localVideo');
        remoteVideo = document.getElementById('remoteVideo');
        document.getElementById('myName').hidden = true;
        document.getElementById('otherElements').hidden = false;
        var constraints = {
            video: true,
            audio: true
          };
          if(navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
          } else {
            alert('Your browser does not support getUserMedia API');
          }
      }    
  }
// Handler when other user call to me 
function handleOffer(offer,name){
    document.getElementById('callInitiator').style.display = 'none';
    document.getElementById('callReceiver').style.display = 'block';
    answerBtn.addEventListener("click", function () { 

        connectedUser = name; 
        yourConn.setRemoteDescription(new RTCSessionDescription(offer)); 
       
        //create an answer to an offer 
        yourConn.createAnswer(function (answer) { 
          yourConn.setLocalDescription(answer);
          send({ 
            type: "answer", 
              answer: answer 
          });
         
        }, function (error) { 
           alert("Error when creating an answer"); 
        }); 
        document.getElementById('callReceiver').style.display = 'none';
        document.getElementById('callOngoing').style.display = 'block'
    })
}

// get media success
  function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.srcObject = stream;
    yourConn = new RTCPeerConnection(peerConnectionConfig);
    connectionState = yourConn.connectionState;
    console.log('connection state inside getusermedia',connectionState)
  
    yourConn.onicecandidate = function (event) { 
      console.log('onicecandidate inside getusermedia success', event.candidate)
      if (event.candidate) { 
         send({ 
            type: "candidate", 
            candidate: event.candidate 
         }); 
      } 
    }; 
    yourConn.ontrack = gotRemoteStream;
    yourConn.addStream(localStream);
  }


  // got remote stream 
  function gotRemoteStream(event) {
    console.log('got remote stream' );
    console.log(event.streams);
    remoteVideo.srcObject = event.streams[0];
  }
  // on answer stream 
  function handleAnswer(answer) { 
    console.log('answer: ', answer)
    yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
  };
  
  function send(msg) { 
    //attach the other peer username to our messages 
    if (connectedUser) { 
      msg.name = connectedUser; 
    } 
    console.log('msg before sending to server',msg)
    serverConnection.emit("message",JSON.stringify(msg)); 
  };

//when we got an ice candidate from a remote user 
function handleCandidate(candidate) { 
    yourConn.addIceCandidate(new RTCIceCandidate(candidate)).cath(error=>console.log(error)); 
  };
  
function errorHandler(error) {
    alert(error);
  }