'use strict';

define(['Preloading', 'Events', 'Utils'], function (Preloading, Events, Utils) {
	const LOCAL_STORAGE_KEY = 'tutorialCompleted';

	const Tutorial = {};

	// Ginos Vorschlag: Alle Tutorials als (animierte) Icons
	// zb Movement = WASD nacheinander jeweils gedrückt

	Tutorial.stages = [{
		markupId: 'movement',
		showUntil: 'controls.movement',
	}, {
		markupId: 'rotate',
		showUntil: 'controls.rotate'
	}, {
		markupId: 'action',
		showUntil: 'controls.action'
	}, {
		markupId: 'yield',
		pointTowards: 'Tree', // nearest gameplay object of type
		showUntil: 'inventory.add',
		eventFilter: function (payload) {
			return payload.itemName === 'Wood';
		}
	}, {
		markupId: 'craft',
		pointTowards: Utils.deg2rad(225), // direction
		showUntil: 'inventory.add',
		eventFilter: function (payload) {
			return payload.itemName === 'WoodClub';
		}
	}, {
		markupId: 'equip',
		pointTowards: Utils.deg2rad(110), // direction
		showUntil: 'character.equipItem',
		eventFilter: function (payload) {
			return payload.item.name === 'WoodClub';
		}
	}, {
		markupId: 'fire',
		pointTowards: Utils.deg2rad(225), // direction
		showUntil: 'inventory.add',
		eventFilter: function (payload) {
			return payload.itemName === 'Campfire';
		}
	}, {
		markupId: 'placing',
		showUntil: 'controls.action',
		eventFilter: function (payload) {
			if (payload.item.name !== 'Campfire') {
				return false;
			}
			return payload.actionType = BerryhunterApi.ActionType.PlaceItem;
		}
	}, {
		markupId: 'eating',
		showUntil: 'controls.action',
		eventFilter: function (payload) {
			if (payload.item.name !== 'Berry') {
				return false;
			}
			return payload.actionType = BerryhunterApi.ActionType.ConsumeItem;
		}

	}, {
		markupId: 'finish',
		showUntil: 'timeout.5000',
	}];

	function showNextStep() {
		Tutorial.currentStage++;
		if (Tutorial.stages.length <= Tutorial.currentStage) {
			// Last step was shown
			localStorage.setItem(LOCAL_STORAGE_KEY, Date.now());
			return;
		}

		let stage = Tutorial.stages[Tutorial.currentStage];
		let tutorialStepElement = document.getElementById('tutorial_' + stage.markupId);
		tutorialStepElement.classList.add('active');

		let eventHandler = function (payload) {
			if (Utils.isFunction(stage.eventFilter) && !stage.eventFilter(payload)) {
				return false;
			}

			tutorialStepElement.classList.remove('active');
			tutorialStepElement.classList.add('done');

			return true;
		};

		if (stage.showUntil.startsWith('timeout.')) {
			setTimeout(eventHandler, stage.showUntil.split('.')[1]);
		} else {
			Events.on(stage.showUntil, eventHandler);
		}
	}

	Preloading.registerPartial('partials/tutorial.html')
		.then(() => {
			Tutorial.rootElement = document.getElementById('tutorial');
			Tutorial.rootElement.addEventListener('transitionend', function (event) {
				event.target.classList.remove('done');
				showNextStep();
			});
		});


	Events.on('game.playing', function () {
		Tutorial.currentStage = -1;

		let lastCompleted = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (lastCompleted !== null) {
			lastCompleted = parseInt(lastCompleted, 10);
			// more than 14 days difference?
			if (Date.now() - lastCompleted > 14 * 24 * 60 * 60 * 1000) {
				showNextStep();
			} else {
				// Set the tutorial as completed for today, to only show tutorials after inactivity
				localStorage.setItem(LOCAL_STORAGE_KEY, Date.now());
			}
		} else {
			// Tutorial was never completed yet
			showNextStep();
		}
	});

	Events.on('game.death', function () {
		// Reset all tutorial elements on death
		let elements = Tutorial.rootElement.getElementsByClassName('tutorialStep');
		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.remove('active');
			elements[i].classList.remove('done');
		}
	});
});