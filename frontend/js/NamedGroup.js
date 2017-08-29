define(['Two'], function (Two) {
	class NamedGroup extends Two.Group {
		constructor(name, children) {
			super(children || []);

			NamedGroup.nameGroup(this, name);
		}
	}

	NamedGroup.nameGroup = function (group, name) {
		group['!name'] = name;
	};

	return NamedGroup;
});