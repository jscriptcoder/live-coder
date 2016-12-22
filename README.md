# Live Coder
Amazing tool to simulate live coding Frontend technologies: *HTML, CSS and Javascript*. That means, You don't actually have to code yourself, just pass a program and **LiveCoder** will do the job for you. No more unexpected problems, typos, exceptions, etc... You prepare the program, making sure everything works fine, and your presentation is ready to go :-)

## Motivation
I always found live coding a great way to present ideas. But we're human, and we make mistakes, above all when there are people watching us. It could be somewhat intimidating... At the same time, I always thought how cool would be if a program could implement other programs in real time :-P

See demo here: [link]

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

| Option            | Type     | Default                   |
| ----------------- | -------- | ------------------------- |
| displayClass?     | string   | *'live-coder\_\_display'* |
| defaultContainer? | string   | *'default-container'*     |
| typingSpeed?      | number   | *50*                      |
| pauseOnClick?     | boolean  | *true*                    |
| paused?           | boolean  | *false*                   |

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
