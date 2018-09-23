"use strict";

function textAlignString(string, length, textAlign) {
    // string can't be longer than the length
    string = string.slice(0, length);
    
    // this many space will be added before and/or after the string to make it the right length
    const lengthDiff = length - string.length;
    
    // right text align, prepend spaces to string
    if (textAlign == "right") {
        string = " ".repeat(lengthDiff) + string;
    }
    // centered text align, add spaces before and after the string
    else if (textAlign == "center") {
        const lengthDiffPerSide = Math.floor(lengthDiff / 2);
        string = " ".repeat(lengthDiffPerSide) + string + " ".repeat(lengthDiffPerSide);
        // if there's an odd number of spaces to be added, add one more to the right
        if (lengthDiff % 2) {
            string += " ";
        }
    }
    // left text align, append spaces
    else {
        string += " ".repeat(lengthDiff);
    }
    
    return string;
}

function Flipper(index, animationDurationMs) {
    this.init = () => {
        // _index in flipper array
        this._index = index || 0;
        
        // merge options with default options
        this._animationDurationMs = animationDurationMs;
        
        // this is the current status of the flipper
        this._animating = false;
        
        // create elements in flipper
        this._elem                 = document.createElement("div");
        this._currentCharacterElem = document.createElement("span");
        this._newCharacterElem     = document.createElement("span");
        
        // add classes to elements
        this._elem.classList.add("f_character");
        this._currentCharacterElem.classList.add("f_current");
        this._newCharacterElem.classList.add("f_new");
        
        // join character elements to the main one
        this._elem.appendChild(this._currentCharacterElem);
        this._elem.appendChild(this._newCharacterElem);
    }
    
    this.getElement  = () => this._elem;
    this.isAnimating = () => this._animating;
    
    this.update = character => {
        // do nothing if character is already set
        if (character == this._currentCharacterElem.innerText) {
            return;
        }
        // do nothing if character is already being updated
        if (this.animating) {
            console.log("Flipper [WARNING]: Ignoring character update request on a flipper that is currently being changed.", this._elem);
            return;
        }
        
        // get the new character ready to appear
        this._newCharacterElem.innerText = character;
        
        // fetch duration from settings
        const duration = this._animationDurationMs;
        
        // apply animations
        this._currentCharacterElem.classList.add("f_animated");
        this._newCharacterElem.classList.add("f_animated");
        
        // say that animation is in progress
        this._animating = true;
        
        // reset when animations are done
        setTimeout(() => {
            // the 'new' character is now the current one
            this._currentCharacterElem.innerText = this._newCharacterElem.innerText;
            
            // clear animations
            this._currentCharacterElem.classList.remove("f_animated");
            this._newCharacterElem.classList.remove("f_animated");
            
            // say that animation is finished
            this._animating = false;
        }, duration);
    };
    
    this.init();
}

function FlipperArray(elem, options) {
    this.init = () => {
        // main (parent) element
        this._elem = elem;
        this._elem.classList.add("f_flipper");
        
        // merge options with default options
        this._options = options || {};
        
        // array of flippers
        this._flipperArray = [];
        
        // queued text (if updates are faster than the animation)
        this._queued = null;
        
        // reset parent element innerHTML & add class
        this._elem.innerHTML = "";
        
        // shorter reference to options & style.setProperty
        const o = this._options;
        const s = this._elem.style;
        const c = window.getComputedStyle(this._elem);
        
        /** set CSS properties from JS options **/
        if (o.fontFamily !== undefined)
            s.setProperty("--f_font-family", o.fontFamily);
        if (o.fontSize !== undefined)
            s.setProperty("--f_font-size", o.fontSize);
        if (o.color !== undefined)
            s.setProperty("--f_color", o.color);
        if (o.backgroundColor !== undefined)
            s.setProperty("--f_background-color", o.backgroundColor);
        if (o.animationDurationMs !== undefined)
            s.setProperty("--f_animation-duration", o.animationDurationMs + "ms");
        /** get JS variables from CSS options **/
        else
            o.animationDurationMs = parseInt(c.getPropertyValue("--f_animation-duration").replace(/\D/g, ""));
        if (o.textAlign === undefined)
            o.textAlign = c.getPropertyValue("--f_text-align").trim();
        if (o.length === undefined)
            o.length = parseInt(c.getPropertyValue("--f_length"));
        if (o.defaultText === undefined)
            o.defaultText = c.getPropertyValue("--f_default-text").trim();
        
        // create flippers and append them to the element
        for (let i = 0; i < o.length; i++) {
            const flipper = new Flipper(i, o.animationDurationMs);
            this._flipperArray.push(flipper);
            this._elem.appendChild(flipper.getElement());
        }
        
        // set default text
        if (o.defaultText) {
            this.update(o.defaultText);
        }
    }
    
    this.getOptions  = () => this._options;
    this.getElement  = () => this._elem;
    
    this.isAnimating = () => {
        for (let i = 0; i < this._options.length; i++) {
            if (this._flipperArray[i].isAnimating()) {
                return true;
            }
        }
        return false;
    };
    
    this.update = string => {
        // don't update if change is already in progress
        if (this.isAnimating()) {
            this._queued = string;
            return;
        }
        
        // string must be a String (e.g. 5 becomes '5')
        string = string ? String(string) : "";
        string = textAlignString(string, this._options.length, this._options.textAlign);
        
        // update each flipper
        for (let i = 0; i < this._options.length; i++) {
            this._flipperArray[i].update(string[i]);
        }
        
        // when finished animating, check if there is anything queued
        setTimeout(() => {
            if (this._queued !== null) {
                this.update(this._queued);
                this._queued = null;
            }
        }, this._options.animationDurationMs + 10); // +10ms to make sure each flippers' setTimeouts are done
    }
    
    this.init();
}

/** DEMO **/
const elems = document.getElementsByClassName("f_flipper");
for (let i = 0; i < elems.length; i++) {
    if (elems[i].classList.contains("demo")) {
        (i => {
            const f = new FlipperArray(elems[i]);
            const o = f.getOptions();
            let isBlank = false;
            setInterval(() => {
                isBlank = !isBlank;
                f.update(isBlank ? o.defaultText : "");
            }, 6 * o.animationDurationMs);
        })(i);
    }
}