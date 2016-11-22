var Live =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var utils_1 = __webpack_require__(1);
	var Coder = (function () {
	    function Coder(config) {
	        if (config === void 0) { config = {}; }
	        this.config = Object.assign({}, Coder.DEFAULT_CONFIG, config);
	        this.$runner = document.getElementsByTagName('head')[0] || document.body;
	        this.$wrapperElem = this.createElement(this.config.wrapperElement);
	        this.$body = document.body;
	        this.$display = this.createDisplay();
	    }
	    Coder.prototype.createElement = function (tagName, props, $appendTo) {
	        if (props === void 0) { props = {}; }
	        var $elem = document.createElement(tagName);
	        for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
	            var propName = _a[_i];
	            $elem[propName] = props[propName];
	        }
	        if ($appendTo) {
	            $appendTo.appendChild($elem);
	        }
	        return $elem;
	    };
	    Coder.prototype.createDisplay = function () {
	        return this.createElement('pre', { className: this.config.displayClass }, document.body);
	    };
	    Coder.prototype.createStyle = function (type) {
	        if (type === void 0) { type = 'text/css'; }
	        return this.createElement('style', { type: type });
	    };
	    Coder.prototype.createScript = function (type) {
	        if (type === void 0) { type = 'text/javascript'; }
	        return this.createElement('script', { type: type });
	    };
	    Coder.prototype.asyncLineBreak = function () {
	        this.$display.textContent += '\n';
	        return Promise.resolve();
	    };
	    Coder.prototype.updateDisplayScroll = function () { };
	    Coder.prototype.run = function (code) {
	        var _this = this;
	        if (code === void 0) { code = ''; }
	        var lines = code.trim().split('\n');
	        var $style;
	        var $element;
	        var $script;
	        return utils_1.asyncForOf(function (line) {
	            var forOfPromise;
	            var extPromise = Promise.resolve();
	            var chars = line.split('');
	            var match = line.match(Coder.DIR_RE);
	            if (match) {
	                var _a = match[1].split(':'), section = _a[0], rest = _a.slice(1);
	                switch (section.toLowerCase()) {
	                    case 'css':
	                        // --- css
	                        // --- css:apply
	                        $script = null;
	                        $element && ($element.dataset['innerHtml'] = '', $element = null);
	                        $style = _this.createStyle();
	                        if (rest[0] && rest[0].toLowerCase() === 'apply') {
	                            _this.$runner.appendChild($style);
	                        }
	                        break;
	                    case 'js':
	                        $style = null;
	                        $element && ($element.dataset['innerHtml'] = '', $element = null);
	                        $script = _this.createScript();
	                        // can't be apply at this point, only at the end,
	                        // would throw exeptions
	                        break;
	                    case 'html':
	                        // --- html ($main)
	                        // --- html:apply ($main)
	                        // --- html:tag
	                        // --- html:tag.class
	                        // --- html:.class (tag = div)
	                        // --- html:tag#id
	                        // --- html:#id (tag = div)
	                        // --- html:tag:apply
	                        // --- html:apply:tag
	                        $script = null;
	                        $style = null;
	                        $element && ($element.dataset['innerHtml'] = '');
	                        if (rest[0]) {
	                            var elem = rest[0], apply = rest[1];
	                            // let's swap if the first one is "apply"
	                            if (elem.toLowerCase() === 'apply') {
	                                _b = [apply || '', elem], elem = _b[0], apply = _b[1];
	                            }
	                            var selector = elem.match(Coder.SEL_RE);
	                            // valid selector?
	                            if (elem && selector) {
	                                $element = document.querySelector(elem);
	                                // does the element exist in the DOM?
	                                if (!$element) {
	                                    var _c = [selector[1] || 'div', selector[3], selector[4]], tagName = _c[0], symbol = _c[1], name_1 = _c[2];
	                                    $element = _this.createElement(tagName);
	                                    if (symbol && name_1) {
	                                        // I know, this is crappy. Only supports classes or ids
	                                        // and not even combined. TODO: make it better
	                                        switch (symbol) {
	                                            case '.':
	                                                $element.className = name_1;
	                                                break;
	                                            case '#':
	                                                $element.id = name_1;
	                                                break;
	                                        }
	                                    }
	                                    if (apply &&
	                                        apply.toLowerCase() === 'apply' &&
	                                        !$element.parentElement) {
	                                        _this.$body.appendChild($element);
	                                    }
	                                }
	                            }
	                            else {
	                                $element = _this.$wrapperElem;
	                                if (apply &&
	                                    apply.toLowerCase() === 'apply' &&
	                                    !$element.parentElement) {
	                                    _this.$body.appendChild($element);
	                                }
	                            }
	                        }
	                        $element = $element || _this.$wrapperElem;
	                        // in case there was already content
	                        // we can continue writing html in the element
	                        $element.dataset['innerHtml'] = $element.innerHTML;
	                        break;
	                    case 'apply':
	                        if ($style) {
	                            _this.$runner.appendChild($style);
	                            $style = _this.createStyle();
	                        }
	                        else if ($element && !$element.parentElement) {
	                            _this.$body.appendChild($element);
	                        }
	                        else if ($script) {
	                            _this.$runner.appendChild($script);
	                            $script = _this.createScript();
	                        }
	                        break;
	                    case 'promise':
	                        extPromise = Promise.resolve();
	                        if (window[rest[0]] instanceof Promise) {
	                            extPromise = window[rest[0]];
	                        }
	                        break;
	                }
	                //forOfPromise = extPromise;
	                forOfPromise = utils_1.asyncForOf(function (char) {
	                    _this.$display.textContent += char;
	                    return extPromise;
	                }, chars, _this.config.typingSpeed).then(function () {
	                    _this.$display.textContent += '\n';
	                    return Promise.resolve();
	                });
	            }
	            else {
	                forOfPromise = utils_1.asyncForOf(function (char) {
	                    _this.$display.textContent += char;
	                    if ($style) {
	                        $style.textContent += char;
	                    }
	                    else if ($element) {
	                        // in order to be able to write dynamic html and
	                        // see the changes right away, we need to store
	                        // the html as a string and innerHTML this string
	                        // into the the element right away. If we don't do so, 
	                        // we lose markup because it becomes invalid and gets lost
	                        $element.dataset['innerHtml'] += char;
	                        $element.innerHTML = $element.dataset['innerHtml'];
	                    }
	                    else if ($script) {
	                        $script.textContent += char;
	                    }
	                    return extPromise;
	                }, chars, _this.config.typingSpeed).then(function () {
	                    _this.$display.textContent += '\n';
	                    if ($style) {
	                        $style.textContent += '\n';
	                    }
	                    else if ($script) {
	                        $script.textContent += '\n';
	                    }
	                    return Promise.resolve();
	                });
	            }
	            return forOfPromise;
	            var _b;
	        }, lines).then(function () {
	            $style = null;
	            if ($element) {
	                $element.dataset['innerHtml'] = '';
	                $element = null;
	            }
	            $script = null;
	            return Promise.resolve();
	        });
	    };
	    Coder.DIR_RE = /^\s*---\s*([a-z|\-|_|\.|#|:]+)?/i;
	    Coder.SEL_RE = /^([a-z|\-|_]+)?((\.|#)([a-z|\-|_]+))?$/i;
	    Coder.domReady = function (callback) {
	        document.addEventListener('DOMContentLoaded', callback);
	    };
	    Coder.DEFAULT_CONFIG = {
	        displayClass: 'live-coder__display',
	        wrapperElement: 'body-inner',
	        typingSpeed: 50
	    };
	    return Coder;
	}());
	exports.Coder = Coder;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var deferred_1 = __webpack_require__(2);
	function asyncLoop(fn, condition, delay) {
	    var deferred = new deferred_1.Deferred();
	    var loop = function () {
	        if (condition()) {
	            fn()
	                .then(function () {
	                if (delay) {
	                    setTimeout(loop, delay);
	                }
	                else {
	                    loop();
	                }
	            })
	                .catch(function () { return deferred.reject(); });
	        }
	        else {
	            deferred.resolve();
	        }
	    };
	    loop();
	    return deferred.promise;
	}
	exports.asyncLoop = asyncLoop;
	function asyncForOf(fn, array, delay) {
	    var index = 0;
	    var length = array.length;
	    var value;
	    var conditionLoop = function () { return index < length; };
	    var bodyLoop = function () {
	        var value = array[index];
	        var promise = fn(value);
	        index++;
	        return promise;
	    };
	    return asyncLoop(bodyLoop, conditionLoop, delay);
	}
	exports.asyncForOf = asyncForOf;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var Deferred = (function () {
	    function Deferred() {
	        var _this = this;
	        this.promise = new Promise(function (resolve, reject) {
	            _this.resolve = resolve;
	            _this.reject = reject;
	        });
	    }
	    return Deferred;
	}());
	exports.Deferred = Deferred;


/***/ }
/******/ ]);