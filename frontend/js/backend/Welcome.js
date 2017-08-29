"use strict";

define([], function () {
	class Welcome {

		/**
		 *
		 * @param {BerryhunterApi.Welcome} welcome
		 */
		constructor(welcome){
			this.serverName = welcome.serverName();
			this.mapWidth = welcome.mapSize().x();
			this.mapHeight = welcome.mapSize().y();
		}
	}

	return Welcome;
});