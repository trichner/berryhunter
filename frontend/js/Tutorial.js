'use strict';

define(['Preloading', 'Events', 'Utils'], function (Preloading, Events, Utils) {
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
	}];

	function showNextStep() {
		Tutorial.currentStage++;
		if (Tutorial.stages.length <= Tutorial.currentStage) {
			// Last step was shown
			console.log('Tutorial complete');
			return;
		}

		let stage = Tutorial.stages[Tutorial.currentStage];
		let tutorialStepElement = document.getElementById('tutorial_' + stage.markupId);
		tutorialStepElement.classList.add('active');

		Events.on(stage.showUntil, function (payload) {
			if (Utils.isFunction(stage.eventFilter) && !stage.eventFilter(payload)) {
				return false;
			}

			console.log('Tutorial Step ' + stage.markupId + ' was done.');

			tutorialStepElement.classList.remove('active');
			tutorialStepElement.classList.add('done');

			return true;
		});
	}

	Preloading.registerPartial('partials/tutorial.html')
		.then(() => {
			Tutorial.rootElement = document.getElementById('tutorial');
			Tutorial.rootElement.addEventListener('transitionend', function (event) {
				console.log(event);
				event.target.classList.remove('done');
				showNextStep();
			});
		});

	Events.on('game.playing', function () {
		// TODO check/write local storage
		// new Date(parseInt(localStorage.getItem('tutorialCompleted'), 10))
		//
		// Date.now();
		Tutorial.currentStage = -1;
		showNextStep();
	});
});