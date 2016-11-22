import { asyncForOf, EmptyPromise } from './utils';

export interface CoderConfig {
  displayClass?: string;
  wrapperElement?: string;
  typingSpeed?: number;
}

export class Coder {
  
  public static DIR_RE = /^\s*---\s*([a-z|\-|_|\.|#|:]+)?/i;
  public static SEL_RE = /^([a-z|\-|_]+)?((\.|#)([a-z|\-|_]+))?$/i;

  public static domReady = (callback: EventListener) => {
    document.addEventListener('DOMContentLoaded', callback);
  };
  
  private static DEFAULT_CONFIG: CoderConfig = {
    displayClass: 'live-coder__display',
    wrapperElement: 'body-inner',
    typingSpeed: 50
  };
  
  private $runner: HTMLElement;
  private $wrapperElem: HTMLElement;
  private $body: HTMLElement;
  private $display: HTMLElement;
  private config: CoderConfig;
  
  constructor(config: CoderConfig = {}) {
    this.config = Object.assign({}, Coder.DEFAULT_CONFIG, config);
    this.$runner = document.getElementsByTagName('head')[0] || document.body;
    this.$wrapperElem = this.createElement(this.config.wrapperElement);
    this.$body = document.body;
    this.$display = this.createDisplay();
    
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

  private asyncLineBreak(): EmptyPromise {
    this.$display.textContent += '\n';
    return Promise.resolve();
  }

  private updateDisplayScroll(): void {}

  public run(code: string = ''): EmptyPromise {
    const lines = code.trim().split('\n');
    
    let $style: HTMLElement;
    let $element: HTMLElement;
    let $script: HTMLElement;

    return asyncForOf((line: string) => {

      let forOfPromise: EmptyPromise;
      let extPromise = Promise.resolve();

      const chars = line.split('');
      const match = line.match(Coder.DIR_RE);
    
      if (match) {

        const [section, ...rest] = match[1].split(':');

        switch (section.toLowerCase()) {
            
          case 'css':

            // --- css
            // --- css:apply

            $script = null;
            $element && ($element.dataset['innerHtml'] = '', $element = null);

            $style = this.createStyle();

            if (rest[0] && rest[0].toLowerCase() === 'apply') {
              this.$runner.appendChild($style);
            }

            break;
            
          case 'js': // --- js

            $style = null;
            $element && ($element.dataset['innerHtml'] = '', $element = null);

            $script = this.createScript();

            // can't be apply at this point, only at the end,
            // would throw exeptions

            break;

          case 'html': // tricky one o_O

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
                  
                  if (apply && 
                      apply.toLowerCase() === 'apply' && 
                      !$element.parentElement) {

                    this.$body.appendChild($element);

                  }
                }
                
              } else {

                $element = this.$wrapperElem;
                if (apply && 
                    apply.toLowerCase() === 'apply' && 
                    !$element.parentElement) {

                  this.$body.appendChild($element);

                }

              }              

            }

            $element = $element || this.$wrapperElem;

            // in case there was already content
            // we can continue writing html in the element
            $element.dataset['innerHtml'] = $element.innerHTML;
            break;
            
          case 'apply': // --- apply

            if ($style) {

              this.$runner.appendChild($style);
              $style = this.createStyle();

            } else if ($element && !$element.parentElement) {

              this.$body.appendChild($element);

            } else if ($script) {

              this.$runner.appendChild($script);
              $script = this.createScript();

            }

            break;

          case 'promise': // --- promise:promiseVar

            extPromise = Promise.resolve();

            if (window[rest[0]] instanceof Promise) {
              extPromise = <Promise<any>>window[rest[0]];
            }

            break;
        }
        
        //forOfPromise = extPromise;

        forOfPromise = asyncForOf((char: string) => {

          this.$display.textContent += char;
          return extPromise;

        }, chars, this.config.typingSpeed).then(() => {

          this.$display.textContent += '\n';
          return Promise.resolve();

        });

      } else {
        
        forOfPromise = asyncForOf((char: string) => {

          this.$display.textContent += char;

          if ($style) {
            $style.textContent += char;
          } else if ($element) {

            // in order to be able to write dynamic html and
            // see the changes right away, we need to store
            // the html as a string and innerHTML this string
            // into the the element right away. If we don't do so, 
            // we lose markup because it becomes invalid and gets lost
            $element.dataset['innerHtml'] += char;
            $element.innerHTML = $element.dataset['innerHtml'];

          } else if ($script) {
            $script.textContent += char;
          }
          
          return extPromise;

        }, chars, this.config.typingSpeed).then(() => {

          this.$display.textContent += '\n';
          if ($style) {
            $style.textContent += '\n';
          } else if ($script) {
            $script.textContent += '\n';
          }

          return Promise.resolve();

        });

      }

      return forOfPromise;

    }, lines).then(() => {

      $style = null;

      if ($element) {
        $element.dataset['innerHtml'] = '';
        $element = null;
      }

      $script = null;

      return Promise.resolve();

    });
    
  }
}