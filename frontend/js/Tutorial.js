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
	Tutorial.currentStage = 0;


	Preloading.registerPartial('partials/tutorial.html')
		.then(() => {
			Tutorial.rootElement = document.getElementById('tutorial');
		});

	function showNextStep() {
		if (Tutorial.stages.length <= Tutorial.currentStage) {
			// Last step was shown
			console.log('Tutorial complete');
			return;
		}

		let stage = Tutorial.stages[Tutorial.currentStage];
		let tutorialStepElement = document.getElementById('tutorial_' + stage.markupId);
		tutorialStepElement.classList.add('active');

		Events.once(stage.showUntil, function (payload) {
			// TODO event filter
			console.log('Tutorial Step ' + stage.markupId + ' was done.');

			tutorialStepElement.classList.remove('active');
			tutorialStepElement.classList.add('done');
			Tutorial.currentStage++;
			showNextStep();
		});
	}

	Events.on('game.playing', function () {
		// TODO localStorage.get/setItem tutorial last shown timestamp
		showNextStep();
	});
});