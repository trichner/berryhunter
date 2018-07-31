'use strict';

define(['Preloading', 'PlayerName', 'Console', 'Utils', 'Events', 'DayCycle', 'backend/SnapshotFactory'],
	function (Preloading, PlayerName, Console, Utils, Events, DayCycle, SnapshotFactory) {
		const EndScreen = {};

		function onDomReady() {
			this.rootElement = document.getElementById('endScreen');
			this.playerNameInput = this.rootElement
				.getElementsByClassName('playerNameInput').item(0);

			PlayerName.prepareForm(document.getElementById('endForm'), this.playerNameInput);

			Utils.preventInputPropagation(this.rootElement);

			this.rootElement.getElementsByClassName('playerForm').item(0)
				.addEventListener('animationend', function () {
					// As soon as the form is faded in, focus the input field
					this.playerNameInput.focus();
				}.bind(this));
		}

		Preloading.registerPartial('partials/endScreen.html')
			.then(() => {
				onDomReady.call(EndScreen);
			});

		EndScreen.show = function () {
			PlayerName.fillInput(this.playerNameInput);
			Console.hide();

			this.rootElement.classList.add('showing');
		};

		EndScreen.hide = function () {
			this.rootElement.classList.remove('showing');
		};

		let joinedAtDayTime;
		let joinedAtServerTick;

		Events.on('game.playing', function () {
			joinedAtDayTime = DayCycle.isDay();
			joinedAtServerTick = SnapshotFactory.getLastGameState().tick;
		});

		Events.on('game.death', function () {
			let deathAtServerTick = SnapshotFactory.getLastGameState().tick;
			let daysSurvived = Math.floor(DayCycle.getDays(deathAtServerTick - joinedAtServerTick) * 2);

			function dayOrNight(isDay, count) {
				if (isDay) {
					if (count <= 1) {
						return 'day';
					} else {
						return 'days';
					}
				} else {
					if (count <= 1) {
						return 'night';
					} else {
						return 'nights';
					}
				}
			}

			for (daysSurvived; daysSurvived <= 5; daysSurvived++) {
				for (let i = 0; i <= 1; i++) {
					joinedAtDayTime = !!i;

					let obituaryText = '';
					obituaryText += 'You survived ';

					if (daysSurvived < 1) {
						obituaryText += 'not even the ';
						obituaryText += dayOrNight(joinedAtDayTime, daysSurvived);
					} else {
						obituaryText += Math.ceil(daysSurvived / 2); // Round up to split an uneven numbers of days and
						                                             // nights to whatever time the player joined
						obituaryText += ' ';
						obituaryText += dayOrNight(joinedAtDayTime, Math.ceil(daysSurvived / 2));
					}

					if (daysSurvived > 1) {
						obituaryText += ' and ';
						obituaryText += Math.floor(daysSurvived / 2); // Round down, to have the rest of the
						                                              // calculation above
						obituaryText += ' ';
						obituaryText += dayOrNight(!joinedAtDayTime, Math.floor(daysSurvived / 2));
					}
					obituaryText += '.';

					console.info(obituaryText);
				}

			}

			// EndScreen.rootElement.getElementsByClassName('obituary').item(0).textContent = obituaryText;
		});

		return EndScreen;
	});