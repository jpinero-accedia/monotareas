MONO TAREAS
===========

Monorepo de ejemplo (pnpm workspaces) para enseñar a empaquetar la misma
app web (HTML/CSS/TS) en escritorio (Tauri) y móvil (Capacitor), con un
backend Express + MariaDB detrás.

```
packages/
  backend/         API REST en Express + MariaDB (TypeScript)
  web/              cliente HTML/CSS/TS, compilado con esbuild
  capacitor-app/    empaqueta packages/web para Android (fuera de Docker)
  tauri-app/        empaqueta packages/web para escritorio (fuera de Docker)
infra/              Dockerfiles y compose.yml — nada de esto vive dentro
                    de los workspaces, el código no sabe que está
                    containerizado
```


Arrancar el stack (backend + MariaDB + phpMyAdmin + web)
---------------------------------------------------------

No hace falta tener Node ni pnpm instalados en la máquina: todo se
instala y se compila **dentro** de los contenedores. Solo hace falta
**Podman** y **Git**.

### Windows

1. Instala **Podman Desktop**: https://podman-desktop.io
   (usa WSL2 por debajo; el propio instalador lo activa si falta —
   puede pedir reiniciar).
2. Abre Podman Desktop y arranca la "Podman machine" la primera vez
   que lo pida.
3. Clona el repo y entra en la carpeta:
   ```
   git clone <url-del-repo>
   cd monotareas_pvt
   ```
4. Levanta todo:
   ```
   podman compose -f infra/compose.yml up -d --build
   ```
   (si `podman compose` no existe en tu versión, prueba `podman-compose`,
   sin espacio — es un binario alternativo que hace lo mismo).

La primera vez tarda varios minutos (descarga imágenes base y compila
TypeScript dentro del build). Las siguientes veces es mucho más rápido
gracias a la caché de capas.

### macOS / Linux

Igual que arriba, pero Podman se instala con tu gestor de paquetes
habitual (`brew install podman podman-compose`, etc.) y hay que
arrancar la máquina manualmente la primera vez:
```
podman machine init
podman machine start
podman compose -f infra/compose.yml up -d --build
```

### Puertos una vez arriba

| Servicio   | URL                     |
|------------|-------------------------|
| API        | http://localhost:3000   |
| phpMyAdmin | http://localhost:8000   |
| Web        | http://localhost:8080   |

### Parar / limpiar

```
podman compose -f infra/compose.yml down       # para los contenedores
podman compose -f infra/compose.yml down -v     # además borra los datos de MariaDB
```

### Antes de la clase, comprueba

- Que la máquina puede crear la VM de Podman (virtualización/Hyper-V/WSL2
  no bloqueados por BIOS o políticas de grupo del centro).
- Que la red del centro no bloquea `docker.io` (de ahí salen las
  imágenes base de `node`, `nginx`, `mariadb` y `phpmyadmin`) — conviene
  probarlo una vez en esa misma red antes de tener alumnos delante.


Desarrollo (con Node/pnpm en el host)
--------------------------------------

Si además quieres editar y compilar fuera de los contenedores (autocompletado
del editor, etc.), necesitas Node 24+ y pnpm:

```
pnpm install
pnpm --filter @monotareas/backend build
pnpm --filter @monotareas/web build
```

`packages/capacitor-app` y `packages/tauri-app` no corren en Docker —
necesitan Android Studio / el toolchain de Rust en tu máquina. Mira el
`README.md` de cada uno para los pasos.
