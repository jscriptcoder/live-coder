import Deferred from './deferred';

export function asyncLoop(fn: {(): Promise<any>}, condition: {(): boolean}, delay?: number): Promise<any> {
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

export function asyncForOf<T>(fn: {(value: T): Promise<any>}, array: T[], delay?: number): Promise<any> {
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