import { Deferred } from './deferred';

export type AnyPromise = Promise<any>;

export function asyncLoop(fn: {(): AnyPromise}, condition: {(): boolean}, delay?: number): AnyPromise {
  const deferred = new Deferred<any>();

  const loop = (): void => {
    if (condition()) {
      fn()
      	.then(() => {
        	if (delay) {
          		setTimeout(loop, delay);
        	} else {
          		loop();
        	}
      	})
      	.catch(() => deferred.reject());
    } else {
      deferred.resolve();
    }
  };

  loop();

  return deferred.promise;
}

export function asyncForOf<T>(fn: {(value: T): AnyPromise}, array: T[], delay?: number): AnyPromise {
  let index: number = 0;
  const length: number = array.length;
  let value: any;

  const conditionLoop = (): boolean => index < length;
  const bodyLoop = () => {
  	const value = array[index];
  	const promise = fn(value);
  	index++;
  	return promise;
  };

  return asyncLoop(bodyLoop, conditionLoop, delay);
}

export function waitForDom(): AnyPromise {
  return new Promise<any>((resolve: Function) => {
    document.addEventListener('DOMContentLoaded', () => resolve() );
  });
}
