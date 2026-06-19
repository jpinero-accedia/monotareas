// vim: ft=typescript: ts=3: sw=3: noet:
// debug-print.ts

type GlobalFlags = Record<symbol, { is_debug: boolean }>;

type DebugFn = (...els: any[]) => void;

interface DebugPrintProps {
	is_enable: () => boolean;
	set_enable: (val: boolean) => void;
	enable: () => void;
	disable: () => void;
}

type DebugPrint = DebugFn & DebugPrintProps;

export default ( function (): DebugPrint {
	const is_debug: symbol = Symbol('is_debug');

	// inicializamos la bandera en globalThis
	//

	const flags = globalThis as unknown as GlobalFlags;

	if ( ! flags[is_debug] ) {
		flags[is_debug] = { is_debug: false };
	}


	// la función que se va a exportar
	//

	const debugPrint = ( (...els: any[]): void => {
		if ( flags[is_debug].is_debug ) {
			els.forEach(e => console.debug(e));
		}
	} ) as DebugPrint;


	// los extras a la función
	//

	debugPrint.is_enable = function (): boolean {
		return flags[is_debug].is_debug;
	}

	debugPrint.set_enable = function (val: boolean): void {
		flags[is_debug].is_debug = val;
	}

	debugPrint.enable = function (): void {
		flags[is_debug].is_debug = true;
	};

	debugPrint.disable = function (): void {
		flags[is_debug].is_debug = false;
	};

	return debugPrint;
})();
