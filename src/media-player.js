
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
    
    registerUpdateFunction(updateFunction){
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
            element : null,
            resource : null
        }; // Set your default options, or add more if necessary
        
        this.parseOptions(options);
        
        console.log(options.element === this.options.element);
        
        this.state = 2;
        this.stateCodes = {
            0 : "new",
            1 : "loading",
            2 : "ready",
            3 : "playing"
        };
        
        
        this.audioEngine = new Flare.AudioEngine("test"); //We are using the basic audio engine
        this.ui = new Flare.UI(this.options.element);
        this.oscillator = new Flare.FlareOscillator();
        
        this.bufferData();

        //bind the callbacks
        var _this= this;
        this.ui.registerPlayButtonCallback(function(){
            _this.handlePlayClick();
        });
        
        this.oscillator.registerUpdateFunction(function(){
            _this.update();
        });
        
        this.audioEngine.registerEndFunction(function(){
            _this.handlePlayEnd();
        });

        
    }
    
    bufferData(){
        
        var request = new XMLHttpRequest();
        request.open('GET', this.options.resource , true);
        request.responseType = 'arraybuffer';
        request.send();
        request.onload = this.decodeAudio.bind(this);
        
    }
    
    decodeAudio(e) {
        
        this.audioData = e.target.response;

        this.audioContext.decodeAudioData(this.audioData).then(function (buffer) {

            this.audioBuffer = buffer;


        }.bind(this));

    }
    
    parseOptions(options){
        
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
    handlePlayClick(){
        
        console.log("clickes");
        if(this.state === 2){
            //start playing
            this.state = 3;
            this.oscillator.run();
            this.audioEngine.play(this.audioBuffer);
            this.ui.setState(2);
            
        }else{
            //Pause
            this.state = 2;
            this.oscillator.stop();
            this.audioEngine.stop();
            this.ui.setState(0);
        }
        
    }
    
    handlePlayEnd(){
        
        this.state = 2;
        this.oscillator.stop();
        this.audioEngine.stop();
        this.ui.setState(0);
        
    }
    
    update(){
        
        console.log();
        var duration = this.audioBuffer.duration;
        var audioTime = this.audioEngine.getCurrentTime();
        var startTime = this.audioEngine.getStartTime();
        var progress = (audioTime - startTime) / duration;
        this.ui.updatePlayProgress(progress);
        
    }

    processRequestData(e) {

    }

};



Flare.MediaPlayerFactory = class {

    static loadMediaPlayers() {
        
        var mediaPlayerElement;
        var mediaPlayerElements = document.getElementsByTagName("flaremediaplayer");

        for(var i = 0; i< mediaPlayerElements.length ; i++){
            
            mediaPlayerElement = mediaPlayerElements[i];
            
            var sources = mediaPlayerElement.getElementsByTagName("source");
            
            var source;
            
            for(var n = 0; n< sources.length ; n++){
                //check each source to see if valid
                source = sources[n];
                
                break;
            }
            
            var options = {
                element : mediaPlayerElement,
                resource : source.src
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
