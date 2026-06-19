# @monotareas/tauri-app

Empaqueta `@monotareas/web` en una app de escritorio con Tauri.
No corre en Docker: necesita el toolchain de Rust instalado en tu máquina.

```sh
pnpm install                                  # en la raíz del monorepo
npx @tauri-apps/cli init                      # solo la primera vez, genera src-tauri/
pnpm --filter @monotareas/tauri-app dev
```

`src-tauri/tauri.conf.json` ya apunta `frontendDist` a `../../web/dist`, así
que `tauri init` no debería sobreescribir esa parte si la mantienes al
regenerar el proyecto.
