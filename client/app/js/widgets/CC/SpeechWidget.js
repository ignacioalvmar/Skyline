function SpeechWidget(broker) {
  var voices, whispers;

  function speak(data) {
    if (!voices) {
      alert("There are no available voices on this device for text to speech!");
    }

    var msg = new SpeechSynthesisUtterance(data.text);

    msg.addEventListener("end", function() {
      if (!data.keepMuted) { broker.pub("fade_audio_in", {}, "CC"); }
      if (data.nextState) {
        var timeout = data.nextStateDelay || 0;
        setTimeout(function() {
          broker.pub(data.nextState, {});
        }, timeout);
      }
    });

    if (data.voice) {
      msg.voice = voices[data.voice];
    } else {
      msg.voice = whispers[10];
    }

    broker.pub("fade_audio_out", {}, "CC");
    setTimeout(function() {
      window.speechSynthesis.speak(msg);
    }, 500);

  }

  window.speechSynthesis.onvoiceschanged = function() {
    voices = speechSynthesis.getVoices();//.filter(function(voice) { return voice.name === 'Whisper'; });
    whispers = speechSynthesis.getVoices().filter(function(voice) { return voice.name === 'Whisper'; });
    console.log("Voices ready!");
  };

  broker.sub("speech", speak, "CC");
}

widgets.push({fn: SpeechWidget, channel: "CC"});