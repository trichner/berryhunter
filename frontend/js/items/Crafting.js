"use strict";

const Crafting = {
	displayedCrafts: [],


	displayAvailableCrafts: function (availableCrafts) {
		if (arraysEqual(this.displayedCrafts, availableCrafts)) {
			// Nothing to do here
			return;
		}

		if (isDefined(this.displayGroup)) {
			this.displayGroup.remove();
		}
		this.displayGroup = new Two.Group();
		groups.overlay.add(this.displayGroup);
		// Display 7 crafts per Row, beginning top left corner

		this.displayedCrafts = availableCrafts;
	}
};