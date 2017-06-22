import * as actions from '../components/mic/actions'

//pass store and actions to middleware.
export const micMiddleware = store => {

  let mediaRecorder;
  let chunks;
  let request;
  let stream;

  function initializeMic() {
    navigator.getUserMedia = (
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );
    if (navigator.getUserMedia) {
      console.log('getUserMedia supported.');

      let constraints = { audio: true };

      let onError = function (err) {
        console.log('The following error occured: ' + err);
      }

      navigator.getUserMedia(constraints, onSuccess, onError);
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
  }


  function onSuccess(stream) {
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.start();

    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    }

    mediaRecorder.onstop = function (e) {
      let blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
      chunks = [];

      request = new XMLHttpRequest();
      request.open("POST", 'http://localhost:3001/audioupload', true);
      request.responseType = "blob";
      request.setRequestHeader("Content-Type", "audio/ogg");
      request.send(blob);
    }
  }
  return next => action => {
    switch (action.type) {
      case actions.START_MIC_RECORDING:
        initializeMic();
        
        store.dispatch(actions.setRecordButtonDisabled(true));
        store.dispatch(actions.setStopButtonDisabled(false));
        break;
      case actions.STOP_MIC_RECORDING:
        mediaRecorder.stop();
        store.dispatch(actions.setRecordButtonDisabled(false));
        store.dispatch(actions.setStopButtonDisabled(true));
        break;
      default:
        break;
    }
    return next(action);
  }





} //end micMiddleware
