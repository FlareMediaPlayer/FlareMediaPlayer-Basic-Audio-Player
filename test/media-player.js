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
        this.buffering = true;

        this.stateCodes = {
            0: "new",
            1: "buffering",
            2: "ready",
            3: "playing"
        };

        this.state = {
            readyState: this.stateCodes[0]
        };

        this.eventQueue = [];

    }

    boot(audioData) {
        this.state.readyState = this.stateCodes[1];
        this.audioData = audioData;

        this.context.decodeAudioData(this.audioData).then(function (buffer) {

            this.audioBuffer = buffer;
            this.state.readyState = this.stateCodes[2];
            this.processEventQueue();

        }.bind(this));


    }

    play() {

        if (this.state.readyState === this.stateCodes[2]) {

            this.audioSource = this.context.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.connect(this.context.destination);
            //bind the handlers
            this.audioSource.onended = this.handlePlayEnd.bind(this);

            this.audioSource.start(0);
        } else {
            this.eventQueue.push(this.play);
        }

    }

    togglePlay() {

    }

    pause() {

    }

    stop() {

    }

    processEventQueue() {

        var callback;
        for (var i = 0; i < this.eventQueue.length; i++) {
            callback = this.eventQueue.shift();
            callback.call();
        }
    }

    handlePlayEnd() {
        console.log("ended");
    }

}

/**
 * This player will act like a simple audio player. It will behave similar to the html5 Audio player
 */
var basicPlayer = class BasicPlayer extends AudioEngine {

    constructor(url) {
        super();
        this.buffering = true;

        //Now we hide the getting of the audio file 

        var request = new XMLHttpRequest();
        request.open('GET', "intro.m4a", true);
        request.responseType = 'arraybuffer';
        request.send();
        request.onload = this.processRequestData.bind(this);
    }

    processRequestData(e) {
        this.boot(e.target.response);
    }

}

module.exports = basicPlayer; // Finally we export the audio engine class
},{}],2:[function(require,module,exports){

//namespace flare
var Flare = Flare || {};


Flare.AudioEngine = require('flare-audio-engine'); //import our audio engine
Flare.UI = require('flare-ui-basic-audio-player');// import our ui;

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
    constructor(url) {
        this.audioEngine = new Flare.AudioEngine(url); //We are using the basic audio engine
        this.ui = new Flare.UI();

        //bind the controls
    }

};




/**
 * If you would like to use this script as a stand alone, use this line to expose
 * The Flare player to the global namespace. If you compile the script along with 
 * other scripts you probably won't need it as long as the compiler resolves all of the
 * require calls.
 */
window.Flare = Flare;

},{"flare-audio-engine":1,"flare-ui-basic-audio-player":3}],3:[function(require,module,exports){
'use strict';
/**
 * Class for interfacing with DOM elements and keep track of attributes/classes to add
 */
class FlareDomElement{
    /**
     * 
     * @param {type} tagName type of element to create
     * @returns {nm$_flare-ui-basic-audio-player.FlareDomElement}
     */
    constructor(tagName, mainClassName){
        this.tagName = tagName;
        this.mainClassName = mainClassName;
        this.baseClassName = "flare";
        this.element = document.createElement(tagName);
        this.classes = {};
        this.attributes = {};
        this.styles = {};
    }
    
    addClass(){

    }
    
    addChild(element){
        this.element.addChild(element);
    }
    
    setBaseClassName(className){
        this.baseClassName = className;
    }
    
    render(){
        this.element.className = "";
        this.element.classList.add(this.baseClassName + "-" + this.mainClassName);
        for(var key in this.styles){
            this.element.style.setProperty(key, this.styles[key]);
        }
        
    }
    
    setStyles(styles){
        this.styles = styles
    }

}

class FlareUI {
    
    constructor(){
        this.baseClass = "flare";
        
        this.playerElements = {};
        
    }
    
    setStyle(element, styles) {

        for (var style in styles) {
            element.style.setProperty(style, styles[style]);
        }

    }
    
    applyStyles(){
        //Go through each element in the player
        for (var playerElement in this.playerElements){
            for(var elementClass in playerElement.classes){
                playerElement.element.style.setProperty(style);
            }
        }
    }
    
    parseTarget(){
        
        if (this.target) {
            if (typeof this.target === 'string') {
                this.domLocation = document.getElementById(this.target);
            } else if (typeof this.target === 'object' && this.target.nodeType === 1) {
                this.domLocation = this.target;
            }
        }else{
            this.domLocation = document.body;
        }
        
    }
    
    appendToDom(){
        //Allways append the container 
        this.domLocation.appendChild(this.playerElements.container.element);
    }
    
    renderElements(){
        //console.log(this.playerElements);
        for (var key in this.playerElements){
            this.playerElements[key].render();
        }
    }
}

class BasicAudioPlayer extends FlareUI {

    constructor(target) {
        super();
        this.target = target; // The desired location to append the player to
        this.parseTarget(); //parse the desired location to append to
        this.boot(); // Here we create our player
        this.renderElements(); //Applies all custom settings to the elements
        this.appendToDom(); //add our finished player to the DOM
        console.log("ui loaded");
    }

    boot() {

        this.playerElements.container = new FlareDomElement("div" , "container");
        this.playerElements.container.setStyles({
            'background-color': 'rgba(0,0,0,0.4)',
            width : '60px',
            height: '40px'
        });

    }


}

module.exports = BasicAudioPlayer;
},{}]},{},[2]);
