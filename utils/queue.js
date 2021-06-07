// adapted from https://medium.com/@karenmarkosyan/how-to-manage-promises-into-dynamic-queue-with-vanilla-javascript-9d0d1f8d4df5
// added simple rate limiting

const getTime = () => new Date().getTime();

export default class Queue {
	static rateLimit = 10 * 1000; // 10 seconds
	static queue = [];
	static pendingPromise = false;
	static lastDequeueTime = 0;
	static dequeueTimeout = undefined;

	static enqueue(promise) {
		return new Promise((resolve, reject) => {
			this.queue.push({
				promise,
				resolve,
				reject,
			});
			this.dequeue();
		});
	}

	static dequeue() {
		const currentTime = getTime();
		const diff = currentTime - this.lastDequeueTime;
		if (diff > this.rateLimit) {
			this._dequeue();
		} else {
			clearTimeout(this.dequeueTimeout);
			this.dequeueTimeout = setTimeout(
				() => this.dequeue(),
				this.rateLimit - diff
			);
		}
	}

	static _dequeue() {
		if (this.workingOnPromise) {
			return false;
		}
		const item = this.queue.shift();
		if (!item) {
			return false;
		}
		try {
			this.workingOnPromise = true;
			this.lastDequeueTime = getTime();
			item
				.promise()
				.then((value) => {
					this.workingOnPromise = false;
					item.resolve(value);
					this.dequeue();
				})
				.catch((err) => {
					this.workingOnPromise = false;
					item.reject(err);
					this.dequeue();
				});
		} catch (err) {
			this.workingOnPromise = false;
			item.reject(err);
			this.dequeue();
		}
		return true;
	}
}
