import Deferred from './deferred';

export type EmptyPromise = Promise<undefined>;

export function asyncLoop(fn: {(): EmptyPromise}, condition: {(): boolean}, delay?: number): EmptyPromise {
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

export function asyncForOf<T>(fn: {(value: T): EmptyPromise}, array: T[], delay?: number): EmptyPromise {
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