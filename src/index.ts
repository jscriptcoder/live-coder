import { asyncForOf, EmptyPromise } from './utils';

export interface CoderConfig {
  displayClass?: string;
  defaultContainer?: string;
  typingSpeed?: number;
}

export class Coder {
  
  private static DIR_RE = /^\s*---\s*([a-z0-9|\-|_|\.|#|:]+)?/i;
  private static SEL_RE = /^([a-z0-9|\-|_]+)?((\.|#)([a-z0-9|\-|_]+))?$/i;
  
  private static DEFAULT_CONFIG: CoderConfig = {
    displayClass: 'live-coder__display',
    defaultContainer: 'default-container',
    typingSpeed: 50
  };

  private static waitForDom(): EmptyPromise {
    return new Promise<any>((resolve: Function) => {
      document.addEventListener('DOMContentLoaded', () => resolve() );
    });
  }

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
  private domReady: EmptyPromise;

  private $runner: HTMLElement;
  private $defContainer: HTMLElement;
  private $body: HTMLElement;
  private $display: HTMLElement;

  constructor(config: CoderConfig = {}) {
    this.config = Object.assign({}, Coder.DEFAULT_CONFIG, config);

    this.domReady = Coder.waitForDom();

    this.domReady.then(() => {
      this.$runner = document.getElementsByTagName('head')[0] || document.body;
      this.$defContainer = this.createElement(this.config.defaultContainer);
      this.$body = document.body;
      this.$display = this.createDisplay();
    })
    
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

  private createDisplay(): HTMLElement {
    return this.createElement('pre', { className: this.config.displayClass }, document.body);
  }

  private createStyle(type: string = 'text/css'): HTMLElement {
    return this.createElement('style', { type });
  }

  private createScript(type: string = 'text/javascript'): HTMLElement {
    return this.createElement('script', { type });
  }

  private writeToAndScrollDisplay(char: string): void {
    this.$display.textContent += char;
    this.$display.scrollTop = this.$display.scrollHeight;
  }

  public run(code: string = ''): EmptyPromise {

    return this.domReady.then(() => {

      const lines = code.trim().split('\n');
      
      let $style: HTMLElement;
      let $element: HTMLElement;
      let elemInnerHtml: string;
      let $script: HTMLElement;

      return asyncForOf((line: string) => {

        let forOfPromise: EmptyPromise;
        let returnPromise = Promise.resolve();

        const chars = line.split('');
        const match = line.match(Coder.DIR_RE);
      
        if (match) {

          forOfPromise = asyncForOf((char: string) => {

            this.writeToAndScrollDisplay(char);

            return returnPromise;

          }, chars, this.config.typingSpeed).then(() => {

            this.$display.textContent += '\n';

            const [section, ...rest] = match[1].split(':');

            switch (section.toLowerCase()) {
                
              case 'css':

                // --- css
                // --- css:apply

                $script = null;
                $element = null;
                elemInnerHtml = '';

                $style = this.createStyle();

                Coder.appendIfApply(rest[0], $style, this.$runner);

                break;
                


              case 'js': // --- js

                $style = null;
                $element = null;
                elemInnerHtml = '';

                $script = this.createScript();

                // can't be apply at this point, only at the end,
                // would throw exeptions

                break;



              case 'html': // tricky one o_O

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

                  const selector = elem.match(Coder.SEL_RE);

                  // valid selector?
                  if (elem && selector) {

                    $element = <HTMLElement>document.querySelector(elem);
                    
                    // does the element exist in the DOM?
                    if (!$element) {

                      const [
                        tagName, 
                        symbol, 
                        name] = [selector[1] || 'div', selector[3], selector[4]];

                      $element = this.createElement(tagName);

                      if (symbol && name) {

                        // I know, this is crappy. Only supports classes or ids
                        // and not even combined. TODO: make it better
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

                // in case there was already content
                // we can continue writing html in the element
                elemInnerHtml = $element.innerHTML;
                break;
                


              case 'apply': // --- apply

                if ($style && !Coder.isElementAttached($style)) {

                  this.$runner.appendChild($style);
                  $style = this.createStyle();

                } else if ($element && !Coder.isElementAttached($element)) {

                  this.$body.appendChild($element);

                } else if ($script && !Coder.isElementAttached($script)) {

                  this.$runner.appendChild($script);
                  $script = this.createScript();

                }

                break;



              case 'promise': // --- promise:promiseVar

                if (window[rest[0]] instanceof Promise) {
                  returnPromise = <Promise<any>>window[rest[0]];
                }

                break;
            }


            return returnPromise;

          });        

        } else {

          forOfPromise = asyncForOf((char: string) => {

            this.writeToAndScrollDisplay(char);

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
            
            return returnPromise;

          }, chars, this.config.typingSpeed).then(() => {

            this.writeToAndScrollDisplay('\n');

            if ($style) {
              $style.textContent += '\n';
            } else if ($script) {
              $script.textContent += '\n';
            }

            return returnPromise;

          });

        }

        return forOfPromise;

      }, lines).then(() => {

        $style = null;
        $element = null;
        elemInnerHtml = '';
        $script = null;

        return Promise.resolve();

      });

    });
    
  }
}