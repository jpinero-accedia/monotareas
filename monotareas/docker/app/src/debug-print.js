// vim: ft=javascript: ts=3: sw=3: noet:
// debug-print.js


export default (function () {
	const is_debug = Symbol('is_debug');

	// inicializamos la bandera en globalThis
	//

	if ( ! globalThis[is_debug] ) {
		globalThis[is_debug] = { is_debug: false };
	}
	

	// la función que se va a exportar
	//

	function debugPrint(...els) {
		if ( globalThis[is_debug].is_debug ) {
			els.forEach(e => console.debug(e));
		}
	}


	// los extras a la función
	//

	debugPrint.is_enable = function () {
		return globalThis[is_debug].is_debug;
	}

	debugPrint.set_enable = function (val) {
		let value = false;

		if ( val ) {
			value = true;
		}

		globalThis[is_debug].is_debug = value;
	}

	debugPrint.enable = function () {
		globalThis[is_debug].is_debug = true;
	};
	
	debugPrint.disable = function () {
		globalThis[is_debug].is_debug = false;
	};
	
	return debugPrint;
})();


