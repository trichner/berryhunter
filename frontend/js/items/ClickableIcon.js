"use strict";
require(['two'], function (Two) {
	class ClickableIcon extends Two.Group {
		constructor(size, svg) {
			super();

			this.size = size;

			this.background = new Two.RoundedRectangle(0, 0, size, size, size * 0.1);
			this.add(this.background);
			this.background.noStroke();
			this.background.fill = ClickableIcon.backgroundColors.empty;

			this.iconGroup = new Two.Group();
			this.add(this.iconGroup);

			if (isDefined(svg)) {
				this.setIconGraphic(svg);
			}

			two.once('render', this.onDomReady, this);
		}

		onDomReady() {
			this.domElement = this._renderer.elem;
			this.domElement.addEventListener('pointerup', function (event) {
				event.stopPropagation();

				if (this.clickable && typeof this.onPointerup === 'function') {
					this.onPointerup(event);
				}
			});
			this.domElement.addEventListener('pointerdown', function (event) {
				event.stopPropagation();

				if (this.clickable && typeof this.onPointerdown === 'function') {
					this.onPointerdown(event);
				}
			});
			this.domElement.addEventListener('click', function (event) {
				event.stopPropagation();

				if (this.clickable && typeof this.onClick === 'function') {
					this.onClick(event);
				}
			}.bind(this));

			if (this.clickable) {
				this.domElement.classList.add('clickable');
			}
		}

		setClickable(toggle) {
			this.clickable = toggle;
			if (isUndefined(this.domElement)){
				// domElement is not yet loaded, so skip class modification (it will be done onDomReady)
				return;
			}
			if (toggle) {
				this.domElement.classList.add('clickable');
			} else {
				this.domElement.classList.remove('clickable');
			}
		}

		setIconGraphic(svg) {
			this.itemIcon =
				new InjectedSVG(
					svg,
					0, 0,
					this.size * (0.5 - ClickableIcon.relativePadding));
			this.iconGroup.add(this.itemIcon);
			this.background.fill = ClickableIcon.backgroundColors.filled;
		}

		removeIconGraphic() {
			this.itemIcon.remove();
			delete this.itemIcon;
		}

		activate() {
			this.background.fill = ClickableIcon.backgroundColors.active;
		}

		deactivate() {
			if (this.hasIcon()) {
				this.background.fill = ClickableIcon.backgroundColors.filled;
			} else {
				this.background.fill = ClickableIcon.backgroundColors.empty;
			}
		}

		hasIcon() {
			return isDefined(this.itemIcon);
		}

		// TODO Display busy animation

		// TODO Display delayed click animation

	}

	ClickableIcon.relativeMargin = 0.1;
	ClickableIcon.relativePadding = 0.1;
	ClickableIcon.countColors = {
		font: 'white'
	};
	ClickableIcon.backgroundColors = {
		empty: 'rgba(0, 0, 0, 0.6)',
		filled: 'rgba(64, 64, 64, 0.6)',
		active: 'rgba(255, 255, 255, 0.6)'
	};

	window.ClickableIcon = ClickableIcon;
});

