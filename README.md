# Lichtung

A quiet place to write essays, articles, fragments, visual essays and poster sketches for the Nachplatz blog.

Lichtung runs in the browser and installs like an app on phone and laptop. It works offline: every change is saved on the device first. When a private GitHub repository is connected (under **Sync & backup**), pieces sync there, so phone and laptop share them.

This repository holds only the app. The writing lives in a separate private repository:

```
pieces/<id>.json      one file per piece
images/<id>.jpg       images used in pieces and posters
```

## Files

- `index.html`: the whole app
- `sw.js`: offline support
- `manifest.webmanifest`, `icons/`: installation as an app

## Publishing

Served with GitHub Pages from the `main` branch, root folder.
