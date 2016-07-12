
//namespace flare
var Flare = Flare || {};


Flare.AudioEngine = require('flare-audio-engine'); //import our audio engine
Flare.UI = require('flare-ui-basic-audio-player');// import our ui;

/**
 * 
 * @type Function|constructor
 */
Flare.FlareOscillator = class {

    constructor() {
        
        this.running = false;
        this._this = this;
       
    }

    run() {

        var _this = this;
        this._loopFunction = function (time) {
            return _this.updateRequestAnimationFrame(time);
        };
        this.running = true;
        this._eventId = window.requestAnimationFrame(this._loopFunction);

    }

    /**
     * Stop running the update loop
     * @function stop
     */
    stop() {

        window.cancelAnimationFrame(this._eventId);
        this.running = false;

    }

    /**
     * This is the loop function using RequestAnimationFrame
     * Perform update logic here
     * @param {number} time update time
     * @function updateRequestAnimationFrame
     */
    updateRequestAnimationFrame(time) {

        //console.log(time);

        this._eventId = window.requestAnimationFrame(this._loopFunction);
        this.updateFunction.call();

    }

    registerUpdateFunction(updateFunction) {
        this.updateFunction = updateFunction;
    }

};

/**
 * Create class for final packaged Media Player
 */
Flare.MediaPlayer = class {

    /**
     * For a simple media player, our constructor will simply take the url,
     * All other logic will be abstracted away for an easy to use audio player
     * 
     * @param {type} url the resource url of the audio file
     */
    constructor(options) {

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.options = {
            element: null,
            resource: null
        }; // Set your default options, or add more if necessary

        this.timelinePosition = 0;
        this.startTime = 0;
        this.stopTime = 0;


        this.parseOptions(options);

        this.volume = 0.4;
        this.state = 0;

        

        this.audioEngine = new Flare.AudioEngine("test"); //We are using the basic audio engine
        this.ui = new Flare.UI(this.options.element);
        this.ui.setVolume(this.volume);
        this.oscillator = new Flare.FlareOscillator();
        
        

        //bind the callbacks
        var _this = this;
        this.ui.registerPlayButtonCallback(function () {
            _this.handlePlayClick();
        });

        this.oscillator.registerUpdateFunction(function () {
            _this.update();
        });

        this.audioEngine.registerEndFunction(function () {
            _this.handlePlayEnd();
        });

        this.ui.addSeekListener(function (valueData) {
            _this.handleSeek(valueData);
        });

        //bind directly to the audio engine to not waste another callback function
        this.ui.addVolumeChangedListener(function (valueData) {
            _this.audioEngine.handleVolumeChanged(valueData);
        });
        
        //Start loading data immediately
        this.bufferData();
        
    }

    bufferData() {
        
        this.state = 1;
        this.ui.setState(1);
        this.oscillator.run();
  
  
        var request = new XMLHttpRequest();
        request.open('GET', this.options.resource, true);
        request.responseType = 'arraybuffer';
        request.send();
        request.onload = this.decodeAudio.bind(this);

    }

    decodeAudio(e) {

        this.audioData = e.target.response;

        this.audioContext.decodeAudioData(this.audioData).then(function (buffer) {

            this.audioBuffer = buffer;
            this.duration = buffer.duration;
            this.ui.loadMetaData({duration: buffer.duration});
        
            //loading complete , ready
            this.state = 0;
            this.ui.setState(0);
            this.oscillator.stop();


        }.bind(this));

    }

    parseOptions(options) {

        if (typeof options.element != 'undefined') {

            this.options.element = options.element;

        }

        if (typeof options.resource != 'undefined') {

            this.options.resource = options.resource;

        }

    }

    /**
     * Handles logic for when the play button is clicked.
     */
    handlePlayClick() {

        switch (this.state) {
            case 0:
                //ready
                this.state = 2;
                this.oscillator.run();
                console.log(this.timelinePosition);
                this.startTime = this.audioEngine.play(this.audioBuffer, this.timelinePosition);
                this.ui.setState(2);

                //start playback
                break;
            case 1:
                //buffering
                //play after buffering finishes
                break;
            case 2:
                //playing
                //stop playback
                this.state = 0;
                this.oscillator.stop();
                this.stopTime = this.audioEngine.stop();
                this.startTime - this.stopTime; // Total time played in this run
                this.timelinePosition += this.stopTime - this.startTime; //record total timeline progress
                console.log(this.timelinePosition);
                this.ui.setState(0);
                break;
            default:
            //error
        }

    }

    handlePlayEnd() {

        this.state = 0;
        this.timelinePosition = 0; // reset the timeline back to the beginning
        this.oscillator.stop();
        this.audioEngine.stop();
        this.ui.setState(0);

    }

    update() {

        //update the timeline progress

        switch (this.state) {
            case 0:
                break;
            case 1:
                
                this.ui.updateLoadingAnimation();
                break;
                
            case 2:
                
                var audioTime = this.audioEngine.getCurrentTime();
                this.currentPlayTime = this.timelinePosition + (audioTime - this.startTime);
                var progress = Math.min(Math.max((this.currentPlayTime / this.duration), 0), 1);

                if (progress >= 1)
                    this.handlePlayEnd();
                //console.log(progress);
                this.ui.updatePlayProgress(progress);
                this.ui.updateTimeDisplay(this.currentPlayTime);
                
                break;
            default:
        }

    }

    processRequestData(e) {

    }

    handleSeek(valueData) {
        console.log(valueData);
        this.timelinePosition = this.duration * valueData.percent;
        console.log(this.duration);
        console.log( valueData.percent);
    }

};



Flare.MediaPlayerFactory = class {

    static loadMediaPlayers() {

        var mediaPlayerElement;
        var mediaPlayerElements = document.getElementsByTagName("flaremediaplayer");

        for (var i = 0; i < mediaPlayerElements.length; i++) {

            mediaPlayerElement = mediaPlayerElements[i];

            var sources = mediaPlayerElement.getElementsByTagName("source");

            var source;

            for (var n = 0; n < sources.length; n++) {
                //check each source to see if valid
                source = sources[n];

                break;
            }

            var options = {
                element: mediaPlayerElement,
                resource: source.src
            };

            var mediaPlayer = new Flare.MediaPlayer(options);

        }

    }

};

Flare.MediaPlayerFactory.loadMediaPlayers();



/**
 * If you would like to use this script as a stand alone, use this line to expose
 * The Flare player to the global namespace. If you compile the script along with 
 * other scripts you probably won't need it as long as the compiler resolves all of the
 * require calls.
 */
//window.Flare = Flare;
