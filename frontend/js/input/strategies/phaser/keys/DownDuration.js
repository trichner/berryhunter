define(function () {

	/**
	 * Returns `true` if the Key was pressed down within the `duration` value given, or `false` if it either isn't down,
	 * or was pressed down longer ago than then given duration.
	 */
	return function DownDuration(key, duration) {
		if (duration === undefined) {
			duration = 50;
		}

		return (key.isDown && key.duration < duration);
	};

});
