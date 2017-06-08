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
		let craftsPerRow = 7;
		let size = Relative.height(7);
		let margin = ClickableIcon.relativeMargin * size;

		this.displayGroup.translation.set(
			margin + size/2,
			margin + size/2
		);

		availableCrafts.forEach(function (recipe, index) {
			let clickableIcon = new ClickableIcon(size, recipe.item.icon.svg);
			this.displayGroup.add(clickableIcon);

			let column = index % craftsPerRow;
			let row = Math.floor(index / craftsPerRow);
			clickableIcon.translation.set(
				(size + margin) * column,
				(size + margin) * row
			);

			clickableIcon.onClick = function (event) {
				switch (event.button) {
					// Left Click
					case 0:
						if (MapEditor.isActive()){
							for (let material in recipe.materials) {
								//noinspection JSUnfilteredForInLoop
								player.inventory.removeItem(
									Items[material],
									recipe.materials[material]
								);
							}
							player.inventory.addItem(recipe.item);
						} else {
							// TODO Report craft request to backend
						}
						break;
					case 2:
						// Right Click
						break;
				}
			}.bind(this);
			clickableIcon.setClickable(true);
		}, this);

		this.displayedCrafts = availableCrafts;
	}
};