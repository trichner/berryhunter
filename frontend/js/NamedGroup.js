'use strict';

define(['PIXI', 'Constants'], function (PIXI, Constants) {
	if (!Constants.USE_NAMED_GROUPS){
		return PIXI.Container;
	}

	class NamedGroup extends PIXI.Container {
		constructor(name) {
			super();

			NamedGroup.nameGroup(this, name);
			this.domInitialized = false;
		}
	}

	NamedGroup.nameGroup = function (group, name) {
		group['!name'] = name;
	};

	return NamedGroup;
});