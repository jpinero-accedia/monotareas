# @monotareas/capacitor-app

Empaqueta `@monotareas/web` (HTML/CSS/JS ya compilado) en una app Android con Capacitor.
No corre en Docker: necesita Android Studio / SDK en tu máquina.

```sh
pnpm install                       # en la raíz del monorepo
pnpm --filter @monotareas/capacitor-app sync   # build de web + cap sync
npx cap add android                # solo la primera vez
pnpm --filter @monotareas/capacitor-app open:android
```

Antes de instalar la app en un emulador/dispositivo, edita `src/api.ts` del
paquete `web` (o inyecta `window.__API_BASE__` antes de cargar `bundle.js`)
para que apunte a la IP real del backend, ya que `localhost` dentro del
emulador no es el host.
