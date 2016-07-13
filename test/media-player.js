(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/**
 * Visit www.flaremediaplayer.com
 * This a web audio engine for facilitating the manual playback of audio
 * WARNING This version is still experimental!
 * Visit the git repository to submit bugs
 */
class AudioEngine {

    constructor() {

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.audioData = null;
        this.audioBuffer = null;
        this.audioSource = null;



        this.state = 0;

       
    }

    play(buffer, offset) {

            this.audioSource = this.context.createBufferSource();
            this.audioSource.buffer = buffer;
            this.audioSource.connect(this.gainNode);
            //bind the handlers
            this.audioSource.onended = this.handlePlayEnd.bind(this);

            this.audioSource.start(0, offset);
            this.startTime = this.context.currentTime;
            return this.startTime;
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
        
        this.stopTime = this.context.currentTime;
        this.audioSource.stop();
        return this.stopTime;
        
    }

    handlePlayEnd(e) {
        console.log(e);
        //this.onEndedCallback.call();
    }
    
    handleVolumeChanged(valueData){

        this.gainNode.gain.value = valueData.percent;
        
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
'use strict';
/**
 * Visit www.flaremediaplayer.com
 * A light weight library for easier interfacing with dom objects in order to build
 * interfaces from one single script.
 * WARNING This version is still experimental!
 * Visit the git repository to submit bugs
 */
class FlareDomInterface {

    addClass() {

    }

    addChild(element) {
        this.element.appendChild(element.element);
    }
    
    removeChild(element) {
        this.element.removeChild(element.element);
    }

    setBaseClassName(className) {
        this.baseClassName = className;
    }

    render() {
        //this.element.className = "";
        this.element.classList.add(this.baseClassName + "-" + this.mainClassName);
        for (var key in this.styles) {
            this.element.style.setProperty(key, this.styles[key]);
        }

        for (var key in this.attributes) {
            this.element.setAttribute(key, this.attributes[key]);
        }

    }

    setStyles(styles) {
        this.styles = styles;
    }

    setAttributes(attributes) {
        this.attributes = attributes;
    }

    setContent(content) {
        this.element.innerHTML = content;
    }

    renderStyles(styles) {

        for (var key in styles) {
            this.styles[key] = styles[key];
            this.element.style.setProperty(key, styles[key]);
        }

    }

    renderAttributes(attributes) {

        for (var key in attributes) {
            this.attributes[key] = attributes[key];
            this.element.setAttribute(key, attributes[key]);
        }

    }
    
    removeChildren(){
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }
}

class FlareDomElement extends FlareDomInterface {
    /**
     * 
     * @param {type} tagName type of element to create
     * @returns {nm$_flare-ui-basic-audio-player.FlareDomElement}
     */
    constructor(tagName, mainClassName) {
        super();
        this.state = "0"; //0 ready, 1 buffering, 2 playing, -1 error

        this.tagName = tagName;
        this.mainClassName = mainClassName;
        this.baseClassName = "flare";
        this.element = document.createElement(tagName);
        this.classes = {};
        this.attributes = {};
        this.styles = {};

    }

}

class FlareDomElementNs extends FlareDomInterface {
    constructor(nameSpace, tagName, mainClassName) {
        super();


        this.tagName = tagName;
        this.mainClassName = mainClassName;
        this.baseClassName = "flare";
        this.element = document.createElementNS(nameSpace, tagName);
        this.classes = {};
        this.attributes = {};
        this.styles = {};
    }
}

class FlareDomSlider extends FlareDomElement {

    constructor(tagName, mainClassName) {

        super(tagName, mainClassName);
        this.valueChangedListeners = {};
        //These need to be declared first before binding the handler functions (they count as new functions)
        this.mouseMoveHandler;
        this.mouseUpHandler;


        this.element.onmousedown = this.handleMouseDown.bind(this);
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseUpHandler = this.handleMouseUp.bind(this);

    }

    handleMouseDown(e) {


        this.clickX = e.x;
        this.clickY = e.y;
        this.elementHeight = this.element.offsetHeight;
        this.boundingRect = this.element.getBoundingClientRect();
        this.elementHeight = this.boundingRect.bottom - this.boundingRect.top;
        this.percentValue = 1 - Math.min(1, Math.max(0, (this.clickY - this.boundingRect.top) / this.elementHeight));//(this.clickY - this.boundingRect.top) / this.elementHeight, 1);
        this.dispatchValueChangedEvent({
            percent: this.percentValue
        });

        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        e.stopPropagation();
        return false;

    }

    handleMouseUp(e) {

        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);
        e.stopPropagation;
        return false;

    }

    addValueChangedListener(listener) {

        this.valueChangedListeners[listener] = listener;

    }

    dispatchValueChangedEvent(valueData) {

        for (var listener in this.valueChangedListeners) {
            this.valueChangedListeners[listener].call(this, valueData);
        }

    }

}

class FlareVerticalSlider extends FlareDomSlider {

    constructor(tagName, mainClassName) {

        super("div", mainClassName);

        this.clickY = null;

    }

    handleMouseMove(e) {

        var currentY = e.y;

        //Calculate delta y for a vertical slider
        this.percentValue = 1 - Math.min(1, Math.max(0, (currentY - this.boundingRect.top) / this.elementHeight));
        this.dispatchValueChangedEvent({
            percent: this.percentValue
        });


    }
}

class FlareHorizontalSlider extends FlareDomElement {

    constructor(tagName, mainClassName) {

        super(tagName, mainClassName);
        this.clickX = null;
        this.valueChangedListeners = {};
        //These need to be declared first before binding the handler functions (they count as new functions)
        this.mouseMoveHandler;
        this.mouseUpHandler;

        this.clickX = null;


        this.element.onmousedown = this.handleMouseDown.bind(this);

        //
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseUpHandler = this.handleMouseUp.bind(this);

    }

    setRange(minValue, maxValue) {

        this.minValue = minValue;
        this.maxValue = maxValue;
        this.range = maxValue - minValue;

        this.renderAttributes({
            "aria-valuemin": 0,
            "aria-valuemax": maxValue
        });

    }

    handleMouseDown(e) {


        this.clickX = e.x;
        this.clickY = e.y;
        this.elementWidth = this.element.offsetWidth;
        this.boundingRect = this.element.getBoundingClientRect();
        //this.elementHeight = this.boundingRect.bottom - this.boundingRect.top;
        this.percentValue = Math.min(1, Math.max(0, (this.clickX - this.boundingRect.left) / this.elementWidth));//(this.clickY - this.boundingRect.top) / this.elementHeight, 1);
        this.numericalValue = Math.floor(this.percentValue * this.range);
        this.quantizedPercent = this.numericalValue / this.range;
        this.renderAttributes({
            "aria-valuenow": this.numericalValue,
        });
        this.dispatchValueChangedEvent({
            percent: this.percentValue,
            numerical: this.numericalValue,
            quantizedPercent: this.quantizedPercent
        });

        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        console.log("binding");
        e.stopPropagation();
        return false;

    }

    handleMouseMove(e) {

        var currentX = e.x;

        //Calculate delta y for a vertical slider
        this.percentValue = Math.min(1, Math.max(0, (currentX - this.boundingRect.left) / this.elementWidth));
        this.numericalValue = Math.floor(this.percentValue * this.range);
        this.quantizedPercent = this.numericalValue / this.range;
        this.dispatchValueChangedEvent({
            percent: this.percentValue,
            numerical: this.numericalValue,
            quantizedPercent: this.quantizedPercent
        });
        this.renderAttributes({
            "aria-valuenow": this.numericalValue,
        });


    }

    handleMouseUp(e) {

        console.log("mouseup");
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);
        e.stopPropagation;

        var currentX = e.x;

        //Calculate delta y for a vertical slider
        this.percentValue = Math.min(1, Math.max(0, (currentX - this.boundingRect.left) / this.elementWidth));
        this.numericalValue = Math.floor(this.percentValue * this.range);
        this.quantizedPercent = this.numericalValue / this.range;
        this.dispatchValueChangedEvent({
            percent: this.percentValue,
            numerical: this.numericalValue,
            quantizedPercent: this.quantizedPercent,
            type: "mouseup"
        });
        this.renderAttributes({
            "aria-valuenow": this.numericalValue,
        });

        return false;

    }

    addValueChangedListener(listener) {

        this.valueChangedListeners[listener] = listener;


    }

    dispatchValueChangedEvent(valueData) {

        for (var listener in this.valueChangedListeners) {
            this.valueChangedListeners[listener].call(this, valueData);
        }

    }
}


module.exports.Basic = FlareDomElement;
module.exports.BasicNs = FlareDomElementNs;
module.exports.HorizontalSlider = FlareHorizontalSlider;
module.exports.VerticalSlider = FlareVerticalSlider;


},{}],3:[function(require,module,exports){
'use strict';
/**
 * Visit www.flaremediaplayer.com
 * This is an icon pack for using inline svg graphics
 * WARNING This version is still experimental!
 * Visit the git repository to submit bugs
 */
var FlareDomElements = require("flare-dom-elements");
var FlareDomElementNs = FlareDomElements.BasicNs;

class FlareIcon extends FlareDomElementNs {
    constructor() {
        super("http://www.w3.org/2000/svg", "svg", "icon");
        this.renderAttributes({
        });
    }
}

class FlarePlayIcon extends FlareIcon {
    constructor() {
        super();
        this.renderAttributes({
            viewBox: "0 0 256 256",

        });

        this.playSymbol = new FlareDomElementNs("http://www.w3.org/2000/svg", "polygon");
        this.playSymbol.renderAttributes({
            points: "28.33 20.33 28.33 231.67 231 126 28.33 20.33",
            //fill : "black",

        });
        //this.indent = this.element.appendChild(document.createTextNode("\n"));
        this.addChild(this.playSymbol);
        //this.indent = this.element.appendChild(document.createTextNode("\n"));

    }
}

class FlarePauseIcon extends FlareIcon {
    
    constructor(fill) {
        super();
        this.renderAttributes({
            viewBox: "0 0 256 256",

        });

        this.pauseLeft = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.pauseLeft.renderAttributes({
            d: "M95.77,232.75h-21c-9.37,0-17-10.15-17-22.62V45.86c0-12.47,7.63-22.61,17-22.61h21c9.37,0,17,10.14,17,22.61V210.13c0,12.47-7.63,22.62-17,22.62h0Z"
         
        });

        this.pauseRight = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.pauseRight.renderAttributes({
            d: "M181.27,232.75h-21c-9.37,0-17-10.15-17-22.62V45.86c0-12.47,7.63-22.61,17-22.61h21c9.37,0,17,10.14,17,22.61V210.13c0,12.47-7.63,22.62-17,22.62h0Z"
     
        });

        this.addChild(this.pauseLeft);
        this.addChild(this.pauseRight);


    }
}

class FlareVolumeIcon extends FlareIcon{
    constructor(fill){
        super();
        
        this.renderAttributes({
            viewBox: "0 0 256 256",

        });
        
        this.vol3 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.vol3.renderAttributes({
            d: "M171.88,204.38A6.92,6.92,0,0,1,167,192.56a99,99,0,0,0,0-139.8A6.92,6.92,0,0,1,176.77,43a112.84,112.84,0,0,1,0,159.38,6.9,6.9,0,0,1-4.89,2h0Z"
         
        });
        
        this.vol2 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.vol2.renderAttributes({
            d: "M153.36,185.87a6.92,6.92,0,0,1-4.89-11.82,72.76,72.76,0,0,0,0-102.8,6.92,6.92,0,1,1,9.79-9.79,86.62,86.62,0,0,1,0,122.37,6.9,6.9,0,0,1-4.89,2h0Z"
         
        });
        
        this.vol1 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.vol1.renderAttributes({
            d: "M133.31,165.83A6.92,6.92,0,0,1,128.42,154a44.31,44.31,0,0,0,0-62.69,6.92,6.92,0,0,1,9.79-9.79,58.15,58.15,0,0,1,0,82.27,6.9,6.9,0,0,1-4.89,2h0Z"
         
        });
        
        this.speaker = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.speaker.renderAttributes({
            d: "M108,187.1a6.9,6.9,0,0,1-4.33-1.52L72,160.2H52.47a6.92,6.92,0,0,1-6.92-6.92V92.05a6.92,6.92,0,0,1,6.92-6.92H72L103.7,59.74A6.92,6.92,0,0,1,115,65.14v115A6.92,6.92,0,0,1,108,187.1h0ZM59.39,146.36h15a6.92,6.92,0,0,1,4.33,1.52l22.35,17.89V79.54L78.73,97.45A6.89,6.89,0,0,1,74.41,99h-15v47.38h0Z"
         
        });
        
        this.mute1 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.mute1.renderAttributes({
            d: "M194,164.15a7,7,0,0,1-4.95-2.05l-59.38-59.38a7,7,0,0,1,9.89-9.89L199,152.21A7,7,0,0,1,194,164.15h0Z",
            opacity : 0
        });
        this.mute2 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.mute2.renderAttributes({
            d: "M135,164.56a7,7,0,0,1-5-11.88l58.56-60.2a7,7,0,0,1,10,9.76l-58.56,60.2a7,7,0,0,1-5,2.12h0Z",
            opacity : 0
        });
        
        this.addChild(this.vol3);
        this.addChild(this.vol2);
        this.addChild(this.vol1);
        this.addChild(this.speaker);
        this.addChild(this.mute1);
        this.addChild(this.mute2);
    }
    
    /**
     * 
     * @param {type} volume float between 0 and 1
     */
    setVolume(volume){
     
        var intensity3;
        var intensity2;
        var intensity1;
        var muteIntensity;
        
        if(volume >= 0.67){
            
            intensity3 = (volume - 0.67)/0.33;
            intensity2 = 1;
            intensity1 = 1;
            muteIntensity = 0;
            
        }else if(volume >= 0.34){
            intensity3 = 0;
            intensity2 = (volume - 0.34)/0.33;
            intensity1 = 1;
            muteIntensity = 0;
            
        }else if (volume >0){
            intensity3 = 0;
            intensity2 = 0;
            intensity1 = volume/0.33;
            muteIntensity = 0;
            
        }else{
            intensity3 = 0;
            intensity2 = 0;
            intensity1 = 0;
            muteIntensity = 1;
            
        }
        
        this.vol1.renderAttributes({
            opacity : intensity1
        });
        
        this.vol2.renderAttributes({
            opacity : intensity2
        });
        
        this.vol3.renderAttributes({
            opacity : intensity3
        });
        
        this.mute1.renderAttributes({
            opacity : muteIntensity
        });
        
        this.mute2.renderAttributes({
            opacity : muteIntensity
        });
        
    }
}

class FlareLoadingIcon extends FlareIcon{
    constructor(){
        super();
        this.degree = 0;
        this.renderAttributes({
            viewBox: "0 0 256 256",

        });

        this.gear = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.gear.renderAttributes({
            d: "M138.47,223.76H117.53a13.88,13.88,0,0,1-13.86-13.86V196.35l-6.49-2.52-9.87,9.3a14.21,14.21,0,0,1-19.59,0L52.89,188.3a13.84,13.84,0,0,1,0-19.61l9.55-9.56-2.8-6.42-13.56-.37a13.88,13.88,0,0,1-13.86-13.86v-21A13.88,13.88,0,0,1,46.1,103.66H59.67l2.52-6.49-9.3-9.88a13.84,13.84,0,0,1,0-19.61L67.7,52.88a14.22,14.22,0,0,1,19.61,0l9.57,9.57,6.38-2.81,0.4-13.55a13.88,13.88,0,0,1,13.86-13.86h20.95a13.89,13.89,0,0,1,13.88,13.86V59.66l6.49,2.52,9.85-9.3a13.8,13.8,0,0,1,9.8-4.05h0a13.8,13.8,0,0,1,9.81,4l14.82,14.84a13.87,13.87,0,0,1,0,19.61l-9.57,9.56,2.82,6.39,13.56,0.39a13.87,13.87,0,0,1,13.85,13.86v21a13.87,13.87,0,0,1-13.85,13.86H196.35l-2.53,6.51,9.3,9.86a13.86,13.86,0,0,1,0,19.61l-14.77,14.8a14.21,14.21,0,0,1-19.59,0l-9.61-9.6-6.38,2.81-0.38,13.54a13.89,13.89,0,0,1-13.88,13.86h0ZM120,207.46h16.09V196.35a16.73,16.73,0,0,1,11-15.25l5.6-2.33a14.9,14.9,0,0,1,6.45-1.35A16.39,16.39,0,0,1,170.64,182l7.86,7.86,11.37-11.38L182,170.65a16.72,16.72,0,0,1-3-18.55l2.29-5.6c1.88-5.72,8.44-10.46,15.06-10.46h11.11V120H196.35a16.7,16.7,0,0,1-15.27-11l-2.32-5.56c-2.69-5.37-1.42-13.33,3.23-18l7.88-7.87L178.51,66.13,170.64,74a17,17,0,0,1-18.56,3l-5.59-2.29c-5.71-1.89-10.44-8.45-10.44-15V48.54H120V59.66a16.69,16.69,0,0,1-11,15.25l-5.57,2.33a15,15,0,0,1-6.46,1.36A16.35,16.35,0,0,1,85.36,74l-7.85-7.85L66.14,77.5,74,85.36a16.73,16.73,0,0,1,3,18.55l-2.26,5.58C72.83,115.24,66.27,120,59.67,120H48.54V136H59.67a16.73,16.73,0,0,1,15.26,11l2.32,5.63c2.69,5.36,1.4,13.33-3.25,18l-7.86,7.86,11.37,11.37L85.36,182a16.94,16.94,0,0,1,18.56-3l5.59,2.28c5.84,1.94,10.46,8.36,10.46,15.06v11.11h0Zm8-43.69A35.77,35.77,0,1,1,163.77,128,35.8,35.8,0,0,1,128,163.77h0Zm0-55.23A19.47,19.47,0,1,0,147.47,128,19.48,19.48,0,0,0,128,108.53h0Z"
         
        });


        this.addChild(this.gear);

    }
    
    rotate(degree){
        this.degree = (this.degree + degree) % 360;
        this.gear.renderAttributes({
           transform: "rotate("+  this.degree + " , 128 , 128 )"
         
        });
    }

}


module.exports.FlarePlayIcon = FlarePlayIcon;
module.exports.FlarePauseIcon = FlarePauseIcon;
module.exports.VolumeIcon = FlareVolumeIcon;
module.exports.LoadingIcon = FlareLoadingIcon;
},{"flare-dom-elements":2}],4:[function(require,module,exports){
'use strict';
/**
 * Part of the FlareMediaPlayer Project
 * 
 * visit www.FlareMediaPlayer.com
 * Contact develop@brianparra.com
 */
//namespace flare
var Flare = Flare || {};


Flare.AudioEngine = require('flare-audio-engine'); //import our audio engine
Flare.UI = require('flare-ui-basic-audio-player');// import our ui;
Flare.Oscillator = require('flare-oscillator');

/**
 * Create class for final packaged Media Player
 */
Flare.BasicAudioPlayer = class {

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
        this.errorMessage = "";

        this.parseOptions(options);

        this.volume = 1;
        this.state = 0;



        this.audioEngine = new Flare.AudioEngine("test"); //We are using the basic audio engine
        this.ui = new Flare.UI(this.options.element);
        this.ui.setVolume(this.volume);
        this.oscillator = new Flare.Oscillator();



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

        this.audioContext.decodeAudioData(this.audioData, function (buffer) {

            this.audioBuffer = buffer;
            this.duration = buffer.duration;
            this.ui.loadMetaData({duration: buffer.duration});

            //loading complete , ready
            this.state = 0;
            this.ui.setState(0);
            this.oscillator.stop();


        }.bind(this),
        
                function (e) {
                    //throw error state
                    this.state = -1;
                    this.ui.setState(-1);


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
            case -1:
                break;
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
                //no animations for now
                break;
            case 1:
                //Loading
                this.ui.updateLoadingAnimation();
                break;

            case 2:
                //Playing
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
        console.log(valueData.percent);
    }

    /**
     * Factory function for building the media player
     * @param {type} mediaPlayerElement the element in which to place the media player
     */
    static loadPlayer(mediaPlayerElement) {
        
        var sources = mediaPlayerElement.getElementsByTagName("source");
        var source = sources[0]; // for now just pull the first source
        
        var options = {
            element: mediaPlayerElement,
            resource: source.src
        };
        
        var mediaPlayer = new Flare.BasicAudioPlayer(options);
    }

};



Flare.MediaPlayerFactory = class {

    static loadMediaPlayers() {

        var mediaPlayerElement;
        var mediaPlayerElements = document.getElementsByTagName("flaremediaplayer");
        var playerType;

        for (var i = 0; i < mediaPlayerElements.length; i++) {

            mediaPlayerElement = mediaPlayerElements[i];
            playerType = mediaPlayerElement.getAttribute("type");
            if(playerType in Flare.MediaPlayerFactory.mediaPlayers){
                Flare.MediaPlayerFactory.mediaPlayers[playerType].loadPlayer(mediaPlayerElement);
            }

        }

    }

    static registerMediaPlayers(mediaPlayers) {
        Flare.MediaPlayerFactory.mediaPlayers = mediaPlayers;
    }

};

Flare.MediaPlayerFactory.registerMediaPlayers({
    "basic-player": Flare.BasicAudioPlayer
});
Flare.MediaPlayerFactory.loadMediaPlayers();



/**
 * If you would like to use this script as a stand alone, use this line to expose
 * The Flare player to the global namespace. If you compile the script along with 
 * other scripts you probably won't need it as long as the compiler resolves all of the
 * require calls.
 */
//window.Flare = Flare;

},{"flare-audio-engine":1,"flare-oscillator":5,"flare-ui-basic-audio-player":6}],5:[function(require,module,exports){
'use strict';
/**
 * Part of the FlareMediaPlayer Project
 * WARNING still in beta
 * visit www.FlareMediaPlayer.com
 * Contact develop@brianparra.com
 */
class FlareOscillator{

    constructor() {

        this.running = false;
        this._this = this;
        this.updateFunctions = {};

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
        //this.updateFunction.call();
        for (var updateFunction in this.updateFunctions) {
            this.updateFunctions[updateFunction].call();
        }

    }
    
    registerUpdateFunction(updateFunction) {

        this.updateFunctions[updateFunction] = updateFunction;

    }

};

module.exports = FlareOscillator;
},{}],6:[function(require,module,exports){
'use strict';
/**
 * Class for interfacing with DOM elements and keep track of attributes/classes to add
 */
var FlareDomElements = require('flare-dom-elements');
var FlareIcons = require('flare-icons');


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

    updatePlayProgress(percent) {
        var invert = 1/percent;
        if (invert === 0)
            invert = 1;
        this.playerElements.playHandle.renderStyles({"transform": "scaleX(" + invert + ")"});
        this.playerElements.playProgress.renderStyles({"transform": "scaleX(" + percent + ")"});
    }

    updateTimeDisplay(time) {
        var formattedTime = this.formatTime(time);
        this.playerElements.timeIndicator.setContent(formattedTime + " / " + this.formattedTimelineDuration);
    }

    handlePlayClick(e) {

        this.playButtonCallback.call();

    }

    setState(state) {

        this.state = state;
        switch (this.state) {
            case - 1:
                //display error
                this.playerElements.message.setContent("Error Loading File!");
            case 0 :
                //display ready state
                this.playerElements.playButtonInner.removeChildren();
                this.playerElements.playButtonInner.addChild(this.playerElements.playIcon);
                break;
            case 1:
                //display loading state
                this.playerElements.playButtonInner.removeChildren();
                this.playerElements.playButtonInner.addChild(this.playerElements.loadingIcon);
                break;
            case 2:
                //display play state
                this.playerElements.playButtonInner.removeChildren();
                this.playerElements.playButtonInner.addChild(this.playerElements.pauseIcon);
                break;
            default:
            //display error on all others for now
        }

    }

    registerPlayButtonCallback(callback) {
        this.playButtonCallback = callback;
    }

    /**
     * Set the total duration of the timeline in seconds
     * @returns {undefined}
     */
    setTimelineDuration(duration) {
        this.timelineDuration = duration;
    }

    /**
     * Utility function to format time in seconds into a string
     * @function formatTimeFromSeconds
     * @param {number} timeInSeconds video time in seconds
     * @return {string} formated time
     */
    formatTime(timeInSeconds) {
        var totalSeconds = Math.floor(timeInSeconds);
        var min = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        var formattedTime = this.formatDigits(min) + ":" + this.formatDigits(seconds);

        return formattedTime;
    }

    formatDigits(time) {
        if (time > 9)
            return time
        else
            return "0" + time;
    }

}

class BasicAudioPlayer extends FlareUI {

    constructor(target) {
        
        super();
        this.seekListeners = {};
        this.colorScheme = {
            primary : "#FF5C00",
            secondary : "rgba(255,124,0,0.3)",
            tertiary : "rgba(255,154,0,0.3)",
            font : "white"
        }
        


        this.target = target; // The desired location to append the player to
        //this.parseTarget(); //parse the desired location to append to
        this.initUI(); // Here we create our player
        this.renderElements(); //Applies all custom settings to the elements
        this.appendToDom(); //add our finished player to the DOM
        this.updatePlayProgress(0);
        console.log("ui loaded");
        
        

    }

    loadMetaData(metaData) {

        this.timelineDuration = metaData.duration;
        this.formattedTimelineDuration = this.formatTime(this.timelineDuration);
        this.playerElements.timeIndicator.setContent("0:00 / " + this.formattedTimelineDuration);
        this.playerElements.progressContainer.setRange(0, Math.floor(metaData.duration));

    }

    
    initUI() {

        this.playerElements.container = new FlareDomElements.Basic("div", "container");
        this.playerElements.container.setStyles({
            'background-color': 'black',
            height: '40px',
            color: "white",
            display: "block",
            "font-family" : "arial"
        });

        this.playerElements.controls = new FlareDomElements.Basic("div", "controls");
        this.playerElements.controls.setStyles({
            display: "table",
            "white-space": "nowrap",
            height: "100%",

        });

        this.playerElements.playButton = new FlareDomElements.Basic("div", "play-button");
        this.playerElements.playButton.setStyles({
            height: '100%',
            width: '30px',
            display: "table-cell",
            "vertical-align": "middle",
            "background-color": this.colorScheme.primary,
            cursor: "pointer"
        });

        this.playerElements.playButtonInner = new FlareDomElements.Basic("div", "play-button-inner");
        this.playerElements.playButtonInner.setStyles({
            height: '40px',
            width: '40px'

        });

        this.playerElements.playIcon = new FlareIcons.FlarePlayIcon();


        this.playerElements.pauseIcon = new FlareIcons.FlarePauseIcon();
        this.playerElements.loadingIcon = new FlareIcons.LoadingIcon();
 
        //this.playerElements.playButton.setContent("&#9658;");

        this.playerElements.descriptionContainer = new FlareDomElements.Basic("div", "description-container");
        this.playerElements.descriptionContainer.setStyles({
            position: "absolute",
            "z-index": 1,
            width: "100%",
            height: "100%"

        });

        this.playerElements.volumeContainer = new FlareDomElements.Basic("div", "volume-container");
        this.playerElements.volumeContainer.setStyles({
            height: '100%',
            display: "table-cell",
            "vertical-align": "middle",
            "background-color": this.colorScheme.tertiary,
            cursor: "pointer"

        });
        this.playerElements.volumeContainer.setAttributes({

        });

        this.playerElements.volumeSliderOuter = new FlareDomElements.VerticalSlider("div", "volume-slider-outer");
        this.playerElements.volumeSliderOuter.setStyles({
            height: '100%',
            width: '40px',
            "background-color": this.colorScheme.tertiary,
            cursor: "pointer",
            position: "relative"

        });

        this.playerElements.volumeSliderOuter.setAttributes({
            //role : "slider",
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": 90,
            "touch-action": "none",
            "role": "slider"
        });

        this.playerElements.volumeSliderInner = new FlareDomElements.Basic("div", "volume-slider-inner");
        this.playerElements.volumeSliderInner.setStyles({
            height: '100%',
            width: '100%',
            "background-color": this.colorScheme.primary,
            "transform-origin": "0px bottom",
            transform: "scaleY(0)",
            position: "absolute"
        });

        this.playerElements.volumeSliderDisplayContainer = new FlareDomElements.Basic("div", "volume-slider-display-container");
        this.playerElements.volumeSliderDisplayContainer.setStyles({
            height: '100%',
            width: '100%',
            position: "absolute",
            display: "table"
        });

        this.playerElements.volumeSliderDisplay = new FlareDomElements.Basic("div", "volume-slider-display");
        this.playerElements.volumeSliderDisplay.setStyles({
            "position" : "absolute",
            "left" : "0",
            "right" : "0",
            "top" : "0",
            "bottom" : "0"
        });
        
        this.playerElements.volumeIcon = new FlareIcons.VolumeIcon("white");
        //this.playerElements.volumeSliderDisplay.setContent("	&#128266;");


        this.playerElements.timeIndicatorContainer = new FlareDomElements.Basic("div", "time-indicator-container");
        //this.playerElements.timeIndicator.setContent("0:00 / 0:01");
        this.playerElements.timeIndicatorContainer.setStyles({
            height: '100%',
            display: "table",
            padding: "0 10px",
            float: "right"
        });

        this.playerElements.timeIndicator = new FlareDomElements.Basic("div", "time-indicator");
        this.playerElements.timeIndicator.setStyles({
            height: '100%',
            display: "table-cell",
            "vertical-align": "middle"
        });
        
        
        this.playerElements.messageContainer = new FlareDomElements.Basic("div", "message-container");
        //this.playerElements.timeIndicator.setContent("0:00 / 0:01");
        this.playerElements.messageContainer.setStyles({
            height: '100%',
            display: "table",
            padding: "0 10px",
            float: "left"
        });

        this.playerElements.message = new FlareDomElements.Basic("div", "message");
        this.playerElements.message.setStyles({
            height: '100%',
            display: "table-cell",
            "vertical-align": "middle"
        });

        this.playerElements.progressContainer = new FlareDomElements.HorizontalSlider("div", "progress-container");
        this.playerElements.progressContainer.setStyles({
            height: '1px',
            width: "100%",
            display: "table-cell",
            position: "relative",
            cursor: "pointer"

        });

        this.playerElements.playProgress = new FlareDomElements.Basic("div", "play-progress");
        this.playerElements.playProgress.setStyles({
            'transform-origin': '0 0 ',
            'background-color': this.colorScheme.secondary,
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "0",
            right: "0"

        });

        this.playerElements.playHandle = new FlareDomElements.Basic("div", "play-handle");
        this.playerElements.playHandle.setStyles({
            width : "2px",
            "background-color" : "white",
            height: "100%",
            "float" : "right"

        });

        this.playerElements.container.addChild(this.playerElements.controls);
        this.playerElements.controls.addChild(this.playerElements.playButton);
        this.playerElements.playButton.addChild(this.playerElements.playButtonInner);
        this.playerElements.playButtonInner.addChild(this.playerElements.playIcon);
        this.playerElements.controls.addChild(this.playerElements.progressContainer);
        this.playerElements.progressContainer.addChild(this.playerElements.descriptionContainer);
        this.playerElements.descriptionContainer.addChild(this.playerElements.timeIndicatorContainer);
        this.playerElements.descriptionContainer.addChild(this.playerElements.messageContainer);
        this.playerElements.timeIndicatorContainer.addChild(this.playerElements.timeIndicator);
        this.playerElements.messageContainer.addChild(this.playerElements.message);
        this.playerElements.progressContainer.addChild(this.playerElements.playProgress);
        this.playerElements.playProgress.addChild(this.playerElements.playHandle);
        this.playerElements.controls.addChild(this.playerElements.volumeContainer);
        this.playerElements.volumeContainer.addChild(this.playerElements.volumeSliderOuter);
        this.playerElements.volumeSliderOuter.addChild(this.playerElements.volumeSliderInner);
        //this.playerElements.volumeSliderOuter.addChild(this.playerElements.volumeSliderDisplayContainer);
        this.playerElements.volumeSliderOuter.addChild(this.playerElements.volumeSliderDisplay);
        this.playerElements.volumeSliderDisplay.addChild(this.playerElements.volumeIcon);

        //Finally Bind the controllers
        this.playerElements.playButton.element.onclick = this.handlePlayClick.bind(this);
        //this.playerElements.volumeSliderOuter.element.ondrag = this.handleDrag.bind(this);
        var _this = this;
        this.playerElements.volumeSliderOuter.addValueChangedListener(function (valueData) {
            _this.handleVolumeChanged(valueData);
        });
        
        this.playerElements.progressContainer.addValueChangedListener(function (valueData) {
            _this.handleTimelineSeek(valueData);
        });
    }
    
    setVolume(volume){
        this.handleVolumeChanged({percent : volume});
    }

    handleVolumeChanged(valueData) {

        this.playerElements.volumeSliderInner.renderStyles({
            transform: "scaleY(" + valueData.percent + ")"
        });
        
        this.playerElements.volumeIcon.setVolume(valueData.percent);
    }

    addVolumeChangedListener(listener) {

        this.playerElements.volumeSliderOuter.addValueChangedListener(listener);

    }
    
    handleTimelineSeek(valueData){
        
        this.updateTimeDisplay(valueData.numerical);
        this.updatePlayProgress(valueData.percent);
        if (valueData.type === "mouseup") {
            this.dispatchSeekEvent(valueData);
        }
        
    
    }
    
    addSeekListener(listener) {

        this.seekListeners[listener] = listener;

    }

    dispatchSeekEvent(valueData) {

        for (var listener in this.seekListeners) {
            this.seekListeners[listener].call(this, valueData);
        }

    }
    
    updateLoadingAnimation(){
        this.playerElements.loadingIcon.rotate(1);
    }

}

module.exports = BasicAudioPlayer;

},{"flare-dom-elements":2,"flare-icons":3}]},{},[4]);
