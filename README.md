# Live Coder
Fun tool to simulate live coding Frontend technologies: *HTML, CSS and Javascript*. That means, You don't actually have to code yourself, just pass a program and **LiveCoder** will do the job for you. No more unexpecteds, typos, exceptions, etc... You prepare the program, making sure everything works fine, and your presentation is ready to go :-)

## Motivation
I always found live coding a great way to present ideas. But we're human, and we make mistakes, above all when there are people watching us. It could be somewhat intimidating... At the same time, I always thought how cool would be if a program could implement other programs in real time :-P

[See demo here](https://jscriptcoder.github.io/live-coder/)

## How it works

Write HTML, CSS and/or Javascript as a string in a variable or text file separating each technology using the following directives (starting always with three dashes `---`):

**--- css**: will add the following css in a `<style>` element.

**--- html**: will add the following html in the `<default-container>` element (see **CoderConfig** below).

**--- js**: will add the following javascript code in a `<script>` element.

**--- apply**: will append the last element being processed to the DOM, which will be parsed and executed.

**--- promise(or await):_promiseVar_**: will pause LiveCoder until `promiseVar` is resolved (or rejected).

### Passing parameters after colon (:)

**--- css:_apply_**: will append the `<style>` element to the DOM right away, making the browser parse the styles as the css is written.

**--- html:_apply_**: same effect, although it doesn't look too nice since you'll see angle brackes "<", "</" appearing and disappearing as the html is added.

**--- html:_tag_**: will add the following html in the element `<tag>`. If it doesn't exist in the DOM, it'll be created and added to the `<default-container>` element.

**--- html:_tag#id_**: `<tag id="id">`

**--- html:_tag.class_**: `<tag class="class">`

**--- html:_#id_**: `<div id="id">`

**--- html:_.class_**: `<tag class="class">`

**--- html:tag.class:apply**: `<tag class="class">` with _apply_

After an _apply_, if the following block is the same (css, html or js) as the previous one, you don't need to specify again the type of block. For example:
```css
--- css
body { background-color: lightblue; }
--- apply

h1 { margin: 4px; }
h2 { margin: 2px; }
--- apply
```

Best is to have a look at the [example](https://github.com/jscriptcoder/live-coder/blob/master/test/example.txt) to better understand how it works.

## Download source
```shell
$ git clone https://github.com/jscriptcoder/live-coder.git
$ cd live-coder
```

## Installing and running
```shell
$ npm install
$ npm start
```

## Public API
### Constructor
*Syntax*

```javascript
constructor(config: CoderConfig = {})
```

*Example*

```javascript
var liveCoder = new Live.Coder({
  typingSpeed: 30,
  paused: true
});
```

### CoderConfig

| Option            | Type     | Default                   | Description                                      |
| ----------------- | -------- | ------------------------- | ------------------------------------------------ |
| displayClass?     | string   | *"live-coder\_\_display"* | Class name used for the display element          |
| defaultContainer? | string   | *"default-container"*     | Tag used as default container for other elements |
| typingSpeed?      | number   | *50*                      | Milliseconds between characters                  |
| pauseOnClick?     | boolean  | *true*                    | Pauses/resumes when clicking on the document     |
| paused?           | boolean  | *false*                   | If true, the program is initially paused         |
| writeChar?        | Function | *[See here](https://github.com/jscriptcoder/live-coder/blob/master/src/index.ts#L36)* | Allows you to set your own code writer (e.g Syntax highlight) |
> ? optional

### Coder#run

*Syntax*

```javascript
public run(code: string = ''): Promise<any>
```

*Example*

```javascript
// Runs a program returning a promise that will be
// resolved when the program is finished
liveCoder.run(program)
  .then(() => console.log('Program finished.'));
```

### Coder#setTypingSpeed

*Syntax*

```javascript
public setTypingSpeed(typingSpeed: number): void
```

*Example*

```javascript
liveCoder.setTypingSpeed(10); // Changes the typing speed
```

### Coder#setWriteChar

*Syntax*

```javascript
public setWriteChar(writeChar: {(char: string, $code: HTMLElement): void}): void
```

*Example*

```javascript
// You can pass your custom code-writer
// For example, you might want syntax highlighting
liveCoder.setWriteChar(function (char, $code) {
  $code.innerHTML = highlight($code.textContent + char);
});
```

### Coder#pause

*Syntax*

```javascript
public pause(timeout?: number): void
```

*Example*

```javascript
liveCoder.pause(); // Pauses the program indefinitely
liveCoder.pause(2000); // Pauses the program for 2 seconds
```

### Coder#resume

*Syntax*

```javascript
public resume(): void
```

*Example*

```javascript
liveCoder.resume(); // Resumes the program
```

### Coder#getDeferredPromise

*Syntax* - [Deferred - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred)

```javascript
public getDeferredPromise(): Deferred<any>
```

*Example*

```javascript
const deferred = liveCoder.getDeferredPromise();
deferred.promise.then(() => console.log('Promise resolved'));
setTimeout(() => deferred.resolve(), 3000);
```

### Coder#loadStyle

*Syntax*

```javascript
public loadStyle(url: string): void
```

*Example*

```javascript
liveCoder.loadStyle('http://www.example.com/styles.css'); // Loads a stylesheet
```

### Coder#loadScript

*Syntax*

```javascript
public loadScript(url: string): Promise<any>
```

*Example*

```javascript
// Loads a Javascdript files returning a promise that
// will be resolved once the script is loaded
liveCoder.loadScript('http://www.example.com/script.js')
  .then(() => console.log('Script loaded.'));
```

### Coder#destroy

*Syntax*

```javascript
public destroy(): void
```

*Example*

```javascript
liveCoder.destroy(); // Frees resources
```
