export class Deferred<T> {
  public promise: Promise<T>;
  public resolve: {(value?: T): void};
  public reject: {(error?: any): void};

  constructor() {
    this.promise = new Promise<T>((resolve: {(value?: T): void}, reject: {(error?: any): void}) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}