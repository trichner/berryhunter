define(function () {

	/**
	 * Returns `true` if the Key was released within the `duration` value given, or `false` if it either isn't up,
	 * or was released longer ago than then given duration.
	 */
	return function UpDuration(key, duration) {
		if (duration === undefined) {
			duration = 50;
		}

		return (key.isUp && key.duration < duration);
	}
});