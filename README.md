# p5-manager

[![npm version](https://badge.fury.io/js/p5-manager.svg)](https://badge.fury.io/js/p5-manager)

p5-manager is a p5.js sketch generator and browser. It provides a responsive
web interface for navigating collections, viewing sketches, and reloading them
while you work.

![p5-manager GUI](screenshot.png)

## Features

- Browse multiple p5.js sketches from one responsive interface.
- Open and close a scrollable project sidebar that expands for long names.
- Scale sketch canvases to the available browser width while preserving their
  aspect ratio.
- Load any local collection with `P5_SKETCH_DIR`.
- Automatically discover sketch folders when no `.p5rc` is present.
- Use `.p5rc` to control the collection name, project selection, and order.
- Generate collections, sketches, bundled sketches, and ES6 templates.
- Serve sketches directly or inside the manager UI.
- Reload the selected collection when files change.
- Run locally or mount host collections into Docker as read-only folders.

## Requirements

- Node.js and npm for local development.
- Docker for the container workflow.
- A sketch folder must contain an `index.html` file to be discovered
  automatically.

## Quick start

Install dependencies and build the frontend:

```bash
npm install
npm run build
```

Start the included demo collection:

```bash
node bin/p5-manager.js server
```

Open [http://localhost:5555](http://localhost:5555).

The live-reload client uses port `35729`, so make sure that port is available.

## Loading sketches

### Automatic folder discovery

Point `P5_SKETCH_DIR` at any directory containing sketch subfolders:

```text
my-sketches/
├── particles/
│   ├── index.html
│   └── sketch.js
└── waves/
    ├── index.html
    └── sketch.js
```

Start the server with an absolute or relative path:

```bash
P5_SKETCH_DIR="/Users/you/Sketches" node bin/p5-manager.js server
```

When `.p5rc` is absent, p5-manager discovers every immediate child directory
that contains `index.html` and lists the results alphabetically.

Restart the server after adding or removing sketch folders. The project routes
are registered when the server starts.

### Configuring a collection with `.p5rc`

Add an optional `.p5rc` file at the root of the collection when you want to
choose the displayed sketches or their order:

```json
{
  "name": "My sketches",
  "projects": ["particles", "waves"]
}
```

Only projects listed in `projects` appear in the sidebar when this file exists.
The folder names must match the entries exactly.

### Viewing sketches

The collection is available in two forms:

- Manager UI: `http://localhost:5555/#/particles`
- Direct sketch page: `http://localhost:5555/particles/index.html`

The manager injects responsive canvas styles into same-origin sketch frames.
Generated templates include the same responsive defaults for direct viewing.

## Generator

The CLI is available through `node bin/p5-manager.js` in this repository or as
`p5` when the package is installed globally:

```bash
npm install -g p5-manager
```

Available commands:

```text
p5 new <collection>                 Create a collection and p5.js library
p5 generate <project>               Generate a sketch and register it in .p5rc
p5 generate --bundle <project>      Generate a standalone sketch with libraries
p5 generate --es6 <project>         Generate an ES6 sketch template
p5 rename <old-name> <new-name>     Rename a registered project
p5 update                           Download the latest p5.js release
p5 server                           Start the manager server
```

Short aliases are available: `n`, `g`, `mv`, `u`, and `s`.

### Generator data location

The generator writes to `./data` by default. Override its base directory with
`P5_DATA_DIR`. For example, create a local collection and add a sketch to it:

```bash
P5_DATA_DIR="$PWD" node bin/p5-manager.js new my-collection
P5_DATA_DIR="$PWD/my-collection" node bin/p5-manager.js generate particles
P5_SKETCH_DIR="$PWD/my-collection" node bin/p5-manager.js server
```

Inside the Docker image, the working directory is `/app`, so the same default
becomes `/app/data`. The generator updates `.p5rc` when a regular project is
created or renamed. Restart the server after generating or renaming projects so
the routes are refreshed.

### Bundled projects

A bundled sketch includes its own `libraries/p5.js` and can be served without
the shared collection library:

```bash
node bin/p5-manager.js generate --bundle poster-study
```

## Hosting without Docker

p5-manager can run as a regular Node.js service. A static host alone is not
enough because the application needs the Express API, filesystem access, sketch
routes, and live reload.

On a VPS, home server, or NAS, install dependencies and build once:

```bash
npm ci
npm run build
```

Then run the server with a persistent collection path:

```bash
NODE_ENV=production \
P5_SKETCH_DIR=/srv/p5-sketches \
node bin/p5-manager.js server --port 5555
```

Use a service manager such as systemd or PM2 to keep the process running, and
place Caddy, Nginx, or another reverse proxy in front of port `5555` for HTTPS.
If live reload is needed remotely, proxy port `35729` as well. For a public
read-only gallery, consider disabling the live-reload script before deployment.

## Docker

Build the image:

```bash
docker build -t p5-manager .
```

### Mount an existing collection

Mount a host directory read-only and select it with `P5_SKETCH_DIR`:

```bash
docker run --rm -it \
  -p 5555:5555 \
  -p 35729:35729 \
  -e P5_SKETCH_DIR=/sketches \
  -v "/Users/you/Sketches:/sketches:ro" \
  --name p5-manager \
  p5-manager
```

Open [http://localhost:5555](http://localhost:5555). A mounted collection does
not need `.p5rc`; valid sketch folders are discovered automatically.

### Persist generated sketches

Use a named volume for `/app/data` and tell the server to load it:

```bash
docker volume create p5-manager-data

docker run --rm -it \
  -p 5555:5555 \
  -p 35729:35729 \
  -e P5_SKETCH_DIR=/app/data \
  -v p5-manager-data:/app/data \
  --name p5-manager \
  p5-manager
```

Generate another sketch in a running container:

```bash
docker exec p5-manager node bin/p5-manager.js generate new-sketch
```

Restart the container afterward so the new project route is registered. The
named volume keeps the generated files between container runs.

## Local development

Build the Svelte frontend:

```bash
npm run build
```

Start the full application server:

```bash
node bin/p5-manager.js server
```

Use a different HTTP port when necessary:

```bash
node bin/p5-manager.js server --port 8888
```

`npm start` serves only the compiled frontend. It does not provide
`/api/p5rc`, project routes, or the sketch collection, so use the CLI server for
full application testing.

## HTTP endpoints

- `GET /` — manager frontend.
- `GET /api/p5rc` — collection name and project list.
- `GET /<project>/` — static files for a configured or discovered sketch.
- `GET /assets/*` — manager assets.
- `GET /build/*` — compiled frontend assets.
- `GET /libraries/*` — shared p5.js libraries.

The server does not expose write APIs. Sketch creation and updates are handled
through the filesystem and CLI.

## License

Distributed under the MIT License.

Originally created by Chiun Hau You and inspired by
[kadamwhite/p5-cli](https://github.com/kadamwhite/p5-cli).
