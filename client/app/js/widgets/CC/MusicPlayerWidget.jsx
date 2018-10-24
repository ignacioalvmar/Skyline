/** @jsx React.DOM */
var MusicPlayingView = React.createClass({displayName: "MusicPlayingView",

    // initial widget state
    getInitialState: function() {
        return {percent: "0",
            imageDriver: this.props.imageDriver,
            imagePassenger: this.props.imagePassenger,
            imageEvent: this.props.imageEvent,
            imageEventClick: this.props.imageEventClick,
            imagePlay: this.props.imagePlay,
            imageMute: this.props.imageMute};
    },

    // emit the proper event on image click
    imageEventClick: function()
    {
        if(this.props.imageEventClick != null)
        {
            window.broker.getSocket().emit("consoleEvent", {eventName: this.props.imageEventClick});
        }
    },

    // bind audio player onClick functions to change song action
    onBack: function(){ this.props.onChangeSong("onBack");},
    onMute: function(){ this.props.onChangeSong("onMute");},
    onPlay: function(){ this.props.onChangeSong("onPlay");},
    onNext: function(){ this.props.onChangeSong("onNext");},

    // render the current player state
    render: function()
    {
        return (React.createElement("div", null,
            React.createElement("div", {className: "widget-box third", onClick: this.imageEventClick},
                React.createElement("img", { src: this.state.imageEvent, className: "avatar"})
            ),
            React.createElement("div", {className: "widget-box two-thirds"},
                React.createElement("div", {className: "audio-player"},
                    React.createElement("div", null,
                        React.createElement("div", {className: "cover-art"},
                            React.createElement("img", {src: "assets/audio/player/"+ this.props.song.cover_art})
                        ),
                        React.createElement("img", {src: "assets/images/Shared-Mini-2.svg", className: "shared-mini"}),
                        React.createElement("div", {className: "sharers"},
                            React.createElement("img", {src: this.state.imageDriver, className: "avatar driver"}),
                            React.createElement("img", {src: this.state.imagePassenger, className: "avatar passenger"})
                        )                        
                    ),
                    React.createElement("div", {className: "player"},
                        React.createElement("p", {className: "description"}, React.createElement("strong", null, this.props.song.artist), this.props.song.song),
                        React.createElement("div", {className: "progress-bar"},
                            React.createElement("div", {className: "progressbar-container"},
                                React.createElement(ProgressBar, {completed: this.state.percent, color: "#58c1e2"})
                            )
                        ),
                        React.createElement("div", {className: "controls"},
                            React.createElement("img", {onClick: this.onBack, src: "assets/images/Icon-Audio-Back.svg"}),
                            React.createElement("img", {onClick: this.onPlay, src: this.props.imagePlay}),
                            React.createElement("img", {onClick: this.onNext, src: "assets/images/Icon-Audio-Next.svg"}),
                            React.createElement("img", {onClick: this.onMute, src: this.props.imageMute})
                        )
                    )
                )
            )
        )
        );
    }
});

function MusicPlayerWidget(broker)
{
    // max audio level
    var MAX_AUDIO = .5;

    // does the player need to change songs?
    var action = false;

    // reference to HTML5 audio player
    var player;

    // song list array, current song index and selected song details
    var songList = {};
    var currentSong;
    var song;

    // current player state
    var playing = false;

    // get mp3 file list from assets\audio\player folder
    var socket = broker.getSocket();
    socket.emit("getAudioFiles");
    socket.on("audio_file_names", function (data)
    {
        songList['mp3'] = data;
    });

    // main widget function
    function renderPlayView(data)
    {
        // initialize player and change it when neccesary
        if (!player || action) { player = playSong(); }
        action = false; //reset action

        // assign player to dom
        window.player = player;

        // select play/pause icon
        var playpauseimg;
        if(playing) playpauseimg = "assets/images/Icon-Audio-Pause.svg";
        else playpauseimg = "assets/images/Icon-Audio-Play.svg";

        var muteimg;
        if(player.volume==0) muteimg = "assets/images/Icon-Audio-Mute2.svg";
        else muteimg = "assets/images/Icon-Audio-Mute1.svg";

        // render player
        var playingView = React.render(React.createElement(MusicPlayingView, {
            player: player,
            song:song,
            imageDriver:data.imageDriver,
            imagePassenger: data.imagePassenger,
            imageEvent: data.imageEvent,
            imageEventClick:data.imageEventClick,
            imagePlay: playpauseimg,
            imageMute: muteimg,
            quadrant: data.quadrant,
            songList: songList,
            onChangeSong: onChangeSong
        }), document.getElementById(data.quadrant));

        // update progress bar and call onNext() when reached 100%
        player.ontimeupdate = function()
        {
            if (playingView.isMounted())
            {
                var p = (("" + (100 * player.currentTime / player.duration)).split("\.")[0]);
                if(p==100) playingView.onNext();
                playingView.setState({percent : p});
            }
        }
        //player.onended=... // this gets triggered randomly, cant use it for next song trigger
    }

    // force re-render widget with playlist modifications
    function onChangeSong(actionString)
    {
        action = actionString;
        selectSong();
        renderPlayView({
            imageDriver:this.imageDriver,
            imagePassenger: this.imagePassenger,
            imageEvent: this.imageEvent,
            imageEventClick:this.imageEventClick,
            quadrant: this.quadrant,
            onChangeSong: this.onChangeSong,
            songList: this.songList,
        });
    }

    // generates html5 mp3 player, handles onNext, onBack, onPlay/Pause and mute functions
    function playSong()
    {
        if(song === undefined) selectSong();
        var el = $('body')[0];
        playing = true;
        if (el.mp3)
        {
            if(action=="onNext" || action=="onBack")
            {
                el.mp3.pause();
                el.mp3 = new Audio("assets/audio/player/"+song.file);
                el.mp3.play();
            }
            else if(action=="onPlay" && !el.mp3.paused)
            {
                el.mp3.pause();
                playing = false;
            }
            else if(action=="onPlay" && el.mp3.paused)
            {
                el.mp3.play();
            }
            else if (action=="onMute")
            {
                if(el.mp3.volume==0) el.mp3.volume=MAX_AUDIO;
                else el.mp3.volume=0;
            }
        }
        else
        {
            el.mp3 = new Audio("assets/audio/player/"+song.file);
            el.mp3.play();
            el.mp3.volume = MAX_AUDIO;
        }
        return el.mp3;
    }

    // select random song to initialize, generate song metadata
    function selectSong()
    {
        var music = JSON.parse(songList.mp3);
        var size = music.length;
        if(currentSong === undefined)
        {
            currentSong = Math.floor((Math.random() * size) + 1) - 1;
        }
        else if(action === "onBack")
        {
            if(currentSong==0) currentSong=size-1;
            else currentSong--;
        }
        else if(action === "onNext")
        {
            if(currentSong == size-1) currentSong=0;
            else currentSong++;
        }
        var info = music[currentSong].split("_");
        song = {
            'cover_art': music[currentSong].substring(0,music[currentSong].length - 4)+".jpg",
            'file': music[currentSong],
            'artist': info[0],
            'song': info[1].substring(0,info[1].length - 4)
        }
    }

    //handle fading from external message
    var fadeAudioOut = function() {
        if (player) {
            function reduceValue() {
                if (player.volume > 0) {
                    player.volume -= .1;
                }
                if (player.volume < .1) {
                    player.volume = 0;
                    player.pause();
                } else {
                    setTimeout(reduceValue, 50);
                }
            }
            reduceValue();
        }
    };
    var fadeAudioIn = function() {
        if (player) {
            function increaseValue() {
                if (player.paused) {
                    player.play();
                }
                if (player.volume < MAX_AUDIO) {
                    if (player.volume + .1 >= MAX_AUDIO) {
                        player.volume = MAX_AUDIO
                    } else {
                        player.volume += .1;
                    }
                }
                if (player.volume === MAX_AUDIO) {
                } else {
                    setTimeout(increaseValue, 50);
                }
            }
            increaseValue();
        }
    };

    broker.sub("show_music_player", renderPlayView, broker.getChannel());
    broker.sub("fade_audio_out", fadeAudioOut, broker.getChannel());
    broker.sub("fade_audio_in", fadeAudioIn, broker.getChannel());
}

widgets.push({fn: MusicPlayerWidget, channel: "PASS"});
widgets.push({fn: MusicPlayerWidget, channel: "CC"});