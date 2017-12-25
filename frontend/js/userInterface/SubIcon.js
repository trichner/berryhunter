define(['Utils'], function (Utils) {
	class SubIcon {
		constructor(domElement, iconPath, count) {
			domElement.getElementsByClassName('itemIcon').item(0).setAttribute('src', iconPath);
			this.countElement = domElement.getElementsByClassName('count').item(0);
			this.count = count;
		}
	}

	Object.defineProperty(SubIcon.prototype, 'count', function (count) {
		if (Utils.isDefined(count)) {
			this.countElement.textContent = count;
		} else {
			return parseInt(this.countElement.textContent);
		}
	});

	return SubIcon;
});