import { asyncForOf } from './utils';

export interface LiveCoderConfig {
  typingSpeed?: number;
}

export default class LiveCoder {
  
  public static DIR_RE = /^\s*---\s*([a-z|\.|#|:]+)?/i;
  public static SEL_RE = /([a-z]+)?((\.|#)([a-z]+))?/i;
  
  private static DEFAULT_CONFIG: LiveCoderConfig = {
    typingSpeed: 50
  };
  
  private $body: HTMLElement;
  private $display: HTMLElement;
  private config: LiveCoderConfig;
  
  constructor(config: LiveCoderConfig = {}) {
    this.$body = document.body;
    this.$display = this.createDisplay();
    this.config = Object.assign({}, LiveCoder.DEFAULT_CONFIG, config);
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
    return this.createElement('pre', { className: 'live-coder__display' }, document.body);
  }

  private createStyle(type: string = 'text/css'): HTMLElement {
    return this.createElement('style', { type });
  }

  private createScript(type: string = 'text/javascript'): HTMLElement {
    return this.createElement('script', { type });
  }

  private updateDisplayScroll(): void {}

  public run(code: string = ''): Promise<any> {
    const lines = code.trim().split('\n');
    
    let $style: HTMLElement;
    let $element: HTMLElement;
    let $script: HTMLElement;

    return asyncForOf((line: string) => {

      let forOfPromise: Promise<any>;
      const match = line.match(LiveCoder.DIR_RE);
    
      if (match) {

        const [section, ...rest] = match[1].split(':').map(word => word.toLowerCase());

        switch (section) {
            
          case 'css':

            $element = null;
            $script = null;
            $style = this.createStyle();

            if (rest[0] && rest[0] === 'apply') {
              this.$body.appendChild($style);
            }

            break;
            
          case 'html': // tricky one

            $style = null;
            $script = null;

            if (rest[0]) {
              
              let [elem, apply] = rest;

              // let's swap if the first is "apply" (must be always last)
              if (elem === 'apply') {
                [elem, apply] = [apply, elem];
              }
              
              if (elem) {

                const selector = elem.match(LiveCoder.SEL_RE);

                // valid selector?
                if (selector) {

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
                      // and not even combined. TODO: build something better
                      switch (symbol) {
                        case '.':   
                          $element.className = name;
                          break;
                        case '#':
                          $element.id = name;
                          break;
                      }

                    }
                    
                    if (apply && apply === 'apply') {
                      this.$body.appendChild($element);
                    }
                  }
                  
                } else {

                  $element = this.createElement('div');
                  if (apply && apply === 'apply') {
                    this.$body.appendChild($element);
                  }

                } 
              }
            }

            $element = $element || this.createElement('div');

            // in case there was already content
            // we can continue writing html in the element
            $element.dataset['innerHtml'] = $element.innerHTML;
            break;

          case 'js':

            $style = null;
            $element = null;
            $script = this.createScript();

            break;
            
          case 'apply':

            if ($style) {
              this.$body.appendChild($style);
              $style = this.createStyle();
            } else if ($element) {
              $element.dataset['innerHtml'] = '';
              this.$body.appendChild($element);
              $element = <HTMLElement>$element.cloneNode();
            } else if ($script) {
              this.$body.appendChild($script);
              $script = this.createScript();
            }

            break;
        }
        
        forOfPromise = Promise.resolve();
        
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
          
          return Promise.resolve();

        }, line.split(''), this.config.typingSpeed).then(() => {

          this.$display.textContent += '\n';
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