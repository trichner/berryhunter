"use strict";

define([], function () {
	class Welcome {

		/**
		 *
		 * @param {BerryhunterApi.Welcome} welcome
		 */
		constructor(welcome){
			this.serverName = welcome.serverName();
			this.mapRadius = welcome.mapRadius();
		}
	}

	return Welcome;
});