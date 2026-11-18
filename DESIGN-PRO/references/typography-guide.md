# Typography Guide

## Classification
Serif (old-style, transitional, didone, slab), sans-serif (grotesque, neo-grotesque, geometric, humanist), script, monospace, display.

## Anatomy to know
Baseline, x-height, cap height, ascender, descender, counter, terminal, serif, stem, bowl, ligature.

## Pairing strategies
| Strategy                  | Example idea                              | Mood                |
|---------------------------|-------------------------------------------|---------------------|
| Superfamily               | One family, many weights/widths           | Cohesive, efficient |
| Serif headline + sans body| Editorial serif display with clean sans   | Authoritative, modern |
| Sans headline + serif body| Geometric sans with readable serif        | Friendly, literary  |
| Display + neutral         | Expressive display with neutral grotesque | Distinctive, flexible |
| Mono accent + sans        | Monospace for data/labels                 | Technical           |

Pair fonts that differ clearly or match closely; avoid "almost the same".

## Scales
- Major second 1.125, minor third 1.2, major third 1.25, perfect fourth 1.333, perfect fifth 1.5.
- Example (1.25, base 16): 16, 20, 25, 31, 39, 49.

## Responsive type
Use fluid sizing (e.g. CSS `clamp(1rem, 0.9rem + 0.5vw, 1.25rem)`); keep measure within 45-75 characters; scale line height down as size goes up.

## Variable fonts
Use axes (weight, width, optical size) for flexible hierarchy and smaller files; define named instances in the design system.

## Checklist
Legible at smallest size, tested on target devices, licensed for the use, fallback stack defined, numerals suit data, accents/diacritics supported.
