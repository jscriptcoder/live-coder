import { Deferred } from './deferred';
import {
  asyncForOf,
  waitForDom,
  AnyPromise
} from './utils';

export interface CoderConfig {
  displayClass?: string;
  dirClass?: string;
  htmlClass?: string;
  cssClass?: string;
  jsClass?: string;
  defaultContainer?: string;
  typingSpeed?: number;
  pauseOnClick?: boolean;
  paused?: boolean;
  writeChar?: {(char: string, $code: HTMLElement): void}
}

export class Coder {

  private static DIR_RE = /^\s*---\s*([a-z0-9|\-|_|\.|#|:]+)?/i;
  private static SEL_RE = /^([a-z0-9|\-|_]+)?((\.|#)([a-z0-9|\-|_]+))?$/i;

  private static DEFAULT_CONFIG: CoderConfig = {
    displayClass: 'live-coder__display',
    dirClass: 'directive',
    htmlClass: 'html',
    cssClass: 'css',
    jsClass: 'javascript',
    defaultContainer: 'default-container',
    typingSpeed: 50,
    pauseOnClick: true,
    paused: false,
    writeChar(char: string, $code: HTMLElement) {
      $code.textContent += char;
    }
  };

  private static isElementAttached($elem: HTMLElement): boolean {
    return !!$elem.parentElement;
  }

  private static appendIfApply(apply: string, $elem: HTMLElement, $container: HTMLElement): void {
    if (
      apply &&
      $elem &&
      apply.toLowerCase() === 'apply' &&
      !Coder.isElementAttached($elem)) {

      $container && $container.appendChild($elem);

    }
  }

  private config: CoderConfig;
  private domReady: AnyPromise;
  private paused: Deferred<any>;
  private isPaused: boolean;

  private $runner: HTMLElement;
  private $defContainer: HTMLElement;
  private $body: HTMLElement;
  private $display: HTMLElement;

  private togglePauseListener: EventListener;

  constructor(config: CoderConfig = {}) {
    this.config = Object.assign({}, Coder.DEFAULT_CONFIG, config);

    this.domReady = waitForDom();
    this.paused = new Deferred<any>();
    this.isPaused = true;

    this.init();
  }

  private init(): void {
    this.domReady.then(() => {

      this.$runner = document.getElementsByTagName('head')[0] || document.body;
      this.$defContainer = this.createElement(this.config.defaultContainer);
      this.$body = document.body;
      this.$display = this.getDisplay();

      if (this.config.pauseOnClick) {
        this.togglePauseListener = this.togglePause.bind(this);
        document.addEventListener('click', this.togglePauseListener);
      }

      if (this.config.paused) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  private evalElement($elem: HTMLElement): void {
    this.$runner.appendChild($elem);
  }

  private togglePause(): void {
    if (this.isPaused) {
        this.resume();
    } else {
        this.pause();
    }
  }

  private createElement(tagName: string, props: {[key: string]: any} = {}, $appendTo?: HTMLElement): HTMLElement {
    const $elem = document.createElement(tagName);
    for (let propName of Object.keys(props)) {
      $elem[propName] = props[propName];
    }

    if ($appendTo) {
      $appendTo.appendChild($elem);
    }

    return $elem;
  }

  private getDisplay(): HTMLElement {
    return <HTMLElement>document.querySelector(`.${this.config.displayClass}`) || this.createDisplay();
  }

  private createDisplay(): HTMLElement {
    return this.createElement('pre', { className: this.config.displayClass }, document.body);
  }

  private createStyle(): HTMLStyleElement {
    return <HTMLStyleElement>this.createElement('style', { type: 'text/css' });
  }

  private createScript(): HTMLScriptElement {
    return <HTMLScriptElement>this.createElement('script', { type: 'text/javascript' });
  }

  private createDirective(): HTMLElement {
    return <HTMLElement>this.createElement('code', { className: this.config.dirClass });
  }

  private createCode(className: string): HTMLElement {
    return <HTMLElement>this.createElement('code', { className });
  }

  private createStylesheetLink(): HTMLLinkElement {
    return <HTMLLinkElement>this.createElement('link', {
      rel: 'stylesheet',
      type: 'text/css'
    });
  }

  private writeAndScroll(char: string, $code: HTMLElement): void {
    if (!Coder.isElementAttached($code)) {
      this.$display.appendChild($code);
    }

    if (typeof this.config.writeChar === 'function') {
      this.config.writeChar(char, $code);  
    } else {
      $code.textContent += char;
    }
    
    
    this.$display.scrollTop = this.$display.scrollHeight;
  }

  private continue(continuePromise: AnyPromise) {
    return Promise.all([this.paused.promise, continuePromise]);
  }

  public run(code: string = ''): AnyPromise {

    return this.continue(this.domReady).then(() => {

      const lines = code.trim().split('\n');

      let $style: HTMLStyleElement;
      let $element: HTMLElement;
      let elemInnerHtml: string;
      let $script: HTMLScriptElement;
      let $directive: HTMLElement;
      let $code: HTMLElement;

      return asyncForOf((line: string) => {

        // will resolve for each line processed (either directive or code)
        let forOfPromise: AnyPromise;

        // resolved promise by default until await/promise directive
        let returnPromise = Promise.resolve();

        const chars = line.split('');
        const matchDir = line.match(Coder.DIR_RE);

        if (matchDir) {

          // we're gonna write a directive on the display
          $directive = this.createDirective();

          forOfPromise = asyncForOf((char: string) => {

            this.writeAndScroll(char, $directive);
            return this.continue(returnPromise);

          }, chars, this.config.typingSpeed).then(() => {

            this.$display.innerHTML += '\n';

            const [directive, ...rest] = matchDir[1].split(':');

            switch (directive.toLowerCase()) {

              case 'css':

                // --- css
                // --- css:apply

                $script = null;
                $element = null;
                elemInnerHtml = '';

                $style = this.createStyle();
                $code = this.createCode(this.config.cssClass);

                Coder.appendIfApply(rest[0], $style, this.$runner);

                break;



              case 'js': // --- js

                $style = null;
                $element = null;
                elemInnerHtml = '';

                $script = this.createScript();
                $code = this.createCode(this.config.jsClass);

                // can't be apply at this point, only at the end,
                // would throw exeptions

                break;



              case 'html': // tricky one

                // --- html ($defContainer)
                // --- html:apply ($defContainer)
                // --- html:tag
                // --- html:tag.class
                // --- html:.class (tag = div)
                // --- html:tag#id
                // --- html:#id (tag = div)
                // --- html:tag:apply
                // --- html:apply:tag

                $script = null;
                $style = null;
                elemInnerHtml = '';

                if (rest[0]) {

                  let [elem, apply] = rest;

                  // let's swap if the first one is "apply"
                  if (elem.toLowerCase() === 'apply') {
                    [elem, apply] = [apply || '', elem];
                  }

                  const matchSel = elem.match(Coder.SEL_RE);

                  // valid selector?
                  if (elem && matchSel) {

                    $element = <HTMLElement>document.querySelector(elem);

                    // does the element exist in the DOM?
                    if (!$element) {

                      const [
                        tagName,
                        symbol,
                        name
                      ] = [
                          matchSel[1] || 'div',
                          matchSel[3],
                          matchSel[4]
                      ];

                      $element = this.createElement(tagName);

                      if (symbol && name) {

                        // I know, this is crappy. Only supports classes or ids
                        // and not even combined.
                        // TODO: don't be lazy and make it better
                        switch (symbol) {
                          case '.':
                            $element.className = name;
                            break;
                          case '#':
                            $element.id = name;
                            break;
                        }

                      }

                      Coder.appendIfApply(apply, $element, this.$body);

                    }

                  } else {

                    $element = this.$defContainer;
                    Coder.appendIfApply(apply, $element, this.$body);

                  }

                }

                $element = $element || this.$defContainer;
                $code = this.createCode(this.config.htmlClass);

                // in case there was already content
                // we can continue writing html in the element
                elemInnerHtml = $element.innerHTML;
                break;



              case 'apply': // --- apply

                if ($style && !Coder.isElementAttached($style)) {

                  this.evalElement($style);
                  $style = this.createStyle();
                  $code = this.createCode(this.config.cssClass);

                } else if ($element && !Coder.isElementAttached($element)) {

                  this.$body.appendChild($element);
                  $code = this.createCode(this.config.htmlClass);

                } else if ($script && !Coder.isElementAttached($script)) {

                  this.evalElement($script);
                  $script = this.createScript();
                  $code = this.createCode(this.config.jsClass);

                }

                break;


              case 'await': // --- await:promiseVar
              case 'promise': // --- promise:promiseVar

                if (window[rest[0]] instanceof Promise) {
                  returnPromise = <AnyPromise>window[rest[0]];
                }

                break;
            }


            return this.continue(returnPromise);

          });

        } else {

          forOfPromise = asyncForOf((char: string) => {

            this.writeAndScroll(char, $code);

            if ($style) {
              $style.textContent += char;
            } else if ($element) {

              // in order to be able to write dynamic html and
              // see the changes right away, we need to store
              // the html as a string and innerHTML this string
              // into the the element right away. If we don't do so,
              // we lose markup because it becomes invalid and gets lost
              elemInnerHtml += char;
              $element.innerHTML = elemInnerHtml;

            } else if ($script) {
              $script.textContent += char;
            }

            return this.continue(returnPromise);

          }, chars, this.config.typingSpeed).then(() => {

            this.writeAndScroll('\n', $code);

            if ($style) {
              $style.textContent += '\n';
            } else if ($script) {
              $script.textContent += '\n';
            }
            // we don't care about line breaks in the html element

            return this.continue(returnPromise);

          });

        }

        return forOfPromise;

      }, lines).then(() => {

        $style = null;
        $element = null;
        elemInnerHtml = '';
        $script = null;
        $directive = null;
        $code = null;

        return Promise.resolve();

      });

    });

  }

  public setTypingSpeed(typingSpeed: number): void {
    this.config.typingSpeed = typingSpeed;
  }

  public setWriteChar(writeChar: {(char: string, $code: HTMLElement): void}): void {
    this.config.writeChar = writeChar;
  }

  public pause(timeout?: number): void {
    this.paused = new Deferred<any>();
    this.isPaused = true;

    if (typeof timeout === 'number') {
      setTimeout(() => this.resume(), timeout);
    }
  }

  public resume(): void {
    this.paused.resolve();
    this.isPaused = false;
  }

  public getDeferredPromise(): Deferred<any> {
    return new Deferred<any>();
  }

  public loadStyle(url: string): void {
    const link = this.createStylesheetLink();
    link.href = url;
    this.evalElement(link);
  }

  public loadScript(url: string): AnyPromise {
    const script = this.createScript();
    const deferred = this.getDeferredPromise();

    script.onload = deferred.resolve;
    script.src = url;
    this.evalElement(script);

    return deferred.promise;
  }

  public destroy(): void {
    if (this.togglePauseListener) {
      document.removeEventListener('click', this.togglePauseListener);
    }
  }
}