// https://github.com/myrtleTree33/burpple-api-unofficial/blob/master/src/utils/asyncWorker.js

const asyncWorker = (
	opts = { initialState, maxTimeout, onStart, onTriggered, toProceed, onEnd }
) => {
	const {
		initialState,
		maxTimeout,
		onStart,
		onTriggered,
		toProceed,
		onEnd,
	} = opts;

	let prevState = initialState;

	try {
		onStart();
	} catch (e) {
		console.error(e);
	}

	const runAsyncLoop = () =>
		setTimeout(() => {
			(async () => {
				try {
					const stateCurr = await onTriggered(prevState);
					const toProceedFlag = await toProceed(stateCurr);

					prevState = stateCurr;

					if (toProceedFlag) {
						runAsyncLoop();
					} else {
						onEnd();
					}
				} catch (e) {
					console.error(e);
				}
			})();
		}, maxTimeout);

	return runAsyncLoop;
};

export default asyncWorker;
