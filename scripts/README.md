# Suburble Scripts

Data processing pipeline for [Suburble](https://suburble.com), a Melbourne suburb guessing game.

## What it does

Processes raw GeoJSON data from OpenStreetMap and other sources to produce the JSON files the site needs:

- `factSheet.json` — suburb populations, etymologies, house prices, image attributions
- `suburbNames.json` — list of all suburb names in the game
- `suburbs.json` — suburb polygons with centroids, train lines, and directions
- `trainLines.json` — train line coordinates and colors

## Prerequisites

- [Bun](https://bun.sh) runtime

## Usage

```bash
bun install
bun run main/index.ts
```

Output is written to `./output/final/`. Copy these files to `../site/src/lib/json/` for the site to consume.

## Structure

- `main/index.ts` — pipeline entry point
- `main/commands/` — individual processing steps (suburbs from OSM, train lines, etymologies, etc.)
- `main/consts/` — constants (CBD coordinates, route mappings, etc.)
- `main/types/` — TypeScript types (re-exports shared types from `suburble-shared`)
- `geoJson/` — raw GeoJSON input data
- `csv/` — raw CSV input data (etymologies, house prices)
- `downloads/` — downloaded suburb images
- `output/` — intermediate and final processed output
