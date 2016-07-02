(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/**
 * This will be a base class for the different types of audio players
 */
class AudioEngine {

    constructor() {

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.audioData = null;
        this.audioBuffer = null;
        this.audioSource = null;



        this.state = 0;

       
    }

    play(buffer) {

            this.audioSource = this.context.createBufferSource();
            this.audioSource.buffer = buffer;
            this.audioSource.connect(this.context.destination);
            //bind the handlers
            this.audioSource.onended = this.handlePlayEnd.bind(this);

            this.audioSource.start(0);
            this.startTime = this.context.currentTime;

    }
    
    getCurrentTime(){
        return this.context.currentTime;
    }
    
    getStartTime(){
        return this.startTime;
    }

    togglePlay() {

    }

    pause() {

    }

    stop() {

    }

    handlePlayEnd() {
        this.onEndedCallback.call();
    }

}

/**
 * This player will act like a simple audio player. It will behave similar to the html5 Audio player
 */
var basicPlayer = class BasicPlayer extends AudioEngine {

    constructor(url) {
        super();
    
    }
    
    registerEndFunction(onEndedCallback){
        this.onEndedCallback = onEndedCallback;
    }

}

module.exports = basicPlayer; // Finally we export the audio engine class
},{}],2:[function(require,module,exports){

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

},{"flare-audio-engine":1,"flare-ui-basic-audio-player":3}],3:[function(require,module,exports){
'use strict';
/**
 * Class for interfacing with DOM elements and keep track of attributes/classes to add
 */
class FlareDomElement {
    /**
     * 
     * @param {type} tagName type of element to create
     * @returns {nm$_flare-ui-basic-audio-player.FlareDomElement}
     */
    constructor(tagName, mainClassName) {
        
        this.state = "0"; //0 ready, 1 buffering, 2 playing, -1 error
        
        
        this.tagName = tagName;
        this.mainClassName = mainClassName;
        this.baseClassName = "flare";
        this.element = document.createElement(tagName);
        this.classes = {};
        this.attributes = {};
        this.styles = {};
    }

    addClass() {

    }

    addChild(element) {
        this.element.appendChild(element.element);
    }

    setBaseClassName(className) {
        this.baseClassName = className;
    }

    render() {
        this.element.className = "";
        this.element.classList.add(this.baseClassName + "-" + this.mainClassName);
        for (var key in this.styles) {
            this.element.style.setProperty(key, this.styles[key]);
        }

    }

    setStyles(styles) {
        this.styles = styles
    }

    setContent(content) {
        this.element.innerHTML = content;
    }
    
    renderStyles(styles){
        for(var key in styles){
            this.styles[key] = styles[key];
            this.element.style.setProperty(key, styles[key]);
        }
    }
    

    
}

class FlareUI {

    constructor() {
        
        this.baseClass = "flare";

        this.playerElements = {};

    }

    setStyle(element, styles) {

        for (var style in styles) {
            element.style.setProperty(style, styles[style]);
        }

    }

    parseTarget() {

        if (this.target) {
            if (typeof this.target === 'string') {
                this.domLocation = document.getElementById(this.target);
            } else if (typeof this.target === 'object' && this.target.nodeType === 1) {
                this.domLocation = this.target;
            }
        } else {
            this.domLocation = document.body;
        }

    }

    appendToDom() {
        //Allways append the container 
        this.target.appendChild(this.playerElements.container.element);
    }

    renderElements() {
        //console.log(this.playerElements);
        for (var key in this.playerElements) {
            this.playerElements[key].render();
        }
    }
    
    updatePlayProgress(percent){

        this.playerElements.playProgress.renderStyles({"transform" : "scaleX(" + percent + ")"});
    }
    
    handlePlayClick(e){
        
        this.playButtonCallback.call();
        
    }
    
    setState(state){
        
        this.state = state;
        switch(this.state){
            case -1:
                //display error
                this.playerElements.playButton.setContent("&#8709;");
            case 0 :
                //display ready state
                this.playerElements.playButton.setContent("&#9658;");
                break;
            case 1: 
                //display loading state
                this.playerElements.playButton.setContent("&#9862;");
                break;
            case 2:
                //display play state
                this.playerElements.playButton.setContent("&#9612;&#9612;");
                break;
            default:
                //display error on all others
        }
        
    }
    
    registerPlayButtonCallback(callback){
        this.playButtonCallback = callback;
    }
    
}

class BasicAudioPlayer extends FlareUI {

    constructor(target) {
        super();
        
        this.playButtonColor = "red";
        
        
        this.target = target; // The desired location to append the player to
        //this.parseTarget(); //parse the desired location to append to
        this.boot(); // Here we create our player
        this.renderElements(); //Applies all custom settings to the elements
        this.appendToDom(); //add our finished player to the DOM
        this.updatePlayProgress(0);
        console.log("ui loaded");
        
        
    }

    boot() {

        this.playerElements.container = new FlareDomElement("div", "container");
        this.playerElements.container.setStyles({
            'background-color': 'black',
            height: '40px',
            color : "white",
            display : "block"
        });

        this.playerElements.controls = new FlareDomElement("div", "controls");
        this.playerElements.controls.setStyles({
            display: "table",
            "white-space" : "nowrap",
            height : "100%",
            
        });

        this.playerElements.playButton = new FlareDomElement("div", "play-button");
        this.playerElements.playButton.setStyles({
            height: '100%',
            width: '30px',
            display: "table-cell",
            "vertical-align" : "middle",
            padding : "0 10px",
            "background-color" : this.playButtonColor,
            cursor : "pointer"

        });
        this.playerElements.playButton.setContent("&#9658;");

        this.playerElements.timeIndicator = new FlareDomElement("div", "time-indicator");
        this.playerElements.timeIndicator.setContent("0:00 / 0:01");
        this.playerElements.timeIndicator.setStyles({
            height: '100%',
            display: "table-cell",
            padding : "0 10px",
            "vertical-align" : "middle"
            

        });

        this.playerElements.progressContainer = new FlareDomElement("div", "progress-container");
        this.playerElements.progressContainer.setStyles({
            height: '100%',
            width : "100%",
            display: "table-cell",
            position : "relative"

        });
        
        this.playerElements.playProgress = new FlareDomElement("div", "play-progress");
        this.playerElements.playProgress.setStyles({
            'transform-origin': '0 0 ',
            'background-color': 'rgba(0,0,255,0.4)',
            position : "absolute",
            top : "0",
            bottom : "0",
            left : "0",
            right : "0"

        });

        this.playerElements.container.addChild(this.playerElements.controls);
        this.playerElements.controls.addChild(this.playerElements.playButton);
        this.playerElements.controls.addChild(this.playerElements.progressContainer);
        this.playerElements.progressContainer.addChild(this.playerElements.playProgress);
        this.playerElements.controls.addChild(this.playerElements.timeIndicator);
        
        
        //Finally Bind the controllers
        this.playerElements.playButton.element.onclick = this.handlePlayClick.bind(this);

    }
    
 

}

module.exports = BasicAudioPlayer;
},{}]},{},[2]);
