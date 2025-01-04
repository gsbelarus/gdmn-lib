export class Semaphore {
  private concurrency: number;
  private tasks: Array<() => void>;
  private currentConcurrency: number;
  private freeWaiters: Array<() => void>;

  constructor (concurrency = 1) {
    this.concurrency = concurrency;
    this.tasks = [];
    this.currentConcurrency = 0;
    this.freeWaiters = [];
  }

  acquire(): Promise<void> {
    return new Promise(resolve => {
      if (this.currentConcurrency < this.concurrency) {
        this.currentConcurrency++;
        resolve();
      } else {
        this.tasks.push(resolve);
      }
    });
  }

  release(): void {
    if (this.currentConcurrency > 0) {
      this.currentConcurrency--;
      const nextTask = this.tasks.shift();
      if (nextTask) {
        this.currentConcurrency++;
        nextTask();
      }

      // Check if the semaphore is now free
      if (this.currentConcurrency === 0 && this.tasks.length === 0) {
        this.freeWaiters.forEach(waiter => waiter());
        this.freeWaiters = [];
      }
    } else {
      console.warn('Semaphore release called without an active task.');
    }
  }

  processing(): number {
    return this.currentConcurrency;
  }

  free(): Promise<void> {
    return new Promise(resolve => {
      if (this.currentConcurrency === 0 && this.tasks.length === 0) {
        resolve();
      } else {
        this.freeWaiters.push(resolve);
      }
    });
  }
}
