//  Return boolean (true if it reached the end of the combo, false if not)
define(function () {
	return function AdvanceKeyCombo(event, combo) {
		combo.timeLastMatched = event.timeStamp;
		combo.index++;

		if (combo.index === combo.size) {
			return true;
		}
		else {
			combo.current = combo.keyCodes[combo.index];
			return false;
		}
	};
});