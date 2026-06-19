import type { CapacitorConfig } from '@capacitor/cli';

// webDir apunta al build estático ya generado por @monotareas/web —
// este paquete no construye HTML/CSS/JS propio, solo lo empaqueta.
const config: CapacitorConfig = {
	appId:   'com.monotareas.app',
	appName: 'Mono Tareas',
	webDir:  '../web/dist',
};

export default config;
