define(['Two'], function (Two) {
	class NamedGroup extends Two.Group {
		constructor(name, children) {
			super(children || []);

			NamedGroup.nameGroup(this, name);
			this.domInitialized = false;
		}

		_update() {
			if (!this.domInitialized && this._renderer.elem) {
				this._renderer.elem.setAttribute('data-name', this['!name']);
			}

			Two.Group.prototype._update.apply(this, arguments);
		}
	}

	NamedGroup.nameGroup = function (group, name) {
		group['!name'] = name;
	};

	return NamedGroup;
});