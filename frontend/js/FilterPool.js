"use strict";

define(['Game'], function (Game) {
	class Filter {
		constructor(id, filterElement, elementSelector) {
			this.id = id;
			this.filterElement = filterElement;
			this.domElement = filterElement.querySelector(elementSelector);
		}

		setId(newId){
			this.id = newId;
			this.filterElement.id = newId;
		}
	}

	class FilterPool {

		constructor(filterElment, elementSelector){
			this.elementSelector = elementSelector;
			let filterId = filterElment.id;
			if (!filterId){
				throw 'The filter needs to have an id to work';
			}
			this.protoFilter = new Filter(filterId, filterElment, elementSelector);

			this.sequence = 0;
			this.pool = [];
		}

		/**
		 *
		 * @return {Filter}
		 */
		getFilter() {
			if (this.pool.length > 0){
				// The pool contains one or more filters - use one of them
				return this.pool.pop();
			} else {
				// The pool is empty. Copy the prototype filter and return that
				let newFilterElement = this.protoFilter.filterElement.cloneNode(true);
				Game.domElement.getElementsByTagName('defs')[0].appendChild(newFilterElement);
				let newFilter = new Filter(this.protoFilter.id, newFilterElement, this.elementSelector);
				newFilter.setId(this.protoFilter.id + '_' + this.sequence);
				this.sequence++;
				return newFilter;
			}
		}

		/**
		 * Marks the filter as reusable for the pool.
		 *
		 * @param {Filter} filter
		 */
		freeFilter(filter){
			this.pool.push(filter);
		}
	}

	return FilterPool;
});