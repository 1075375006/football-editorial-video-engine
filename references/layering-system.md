# Four-layer ownership

Every scene documents these layers even when one is empty:

| Layer | Owns | Examples |
| --- | --- | --- |
| L0 Environment | atmosphere and spatial base | paper, stadium, city, field, map, color block |
| L1 Subject | people and physical objects | player cutout, coach, crest supplied as licensed asset, trophy |
| L2 Information | facts the viewer must read | headline, team name, date, number, result, conclusion |
| L3 Annotation | explanation of relationships | arrow, circle, zone, route, connector, label |

Image generation may return only L0 and L1. Remotion owns L2 and L3. A missing asset must fall back to a neutral, labeled placeholder rather than silently inventing a crest or fact.

## Scene review questions

1. Can the main claim be read without the annotation?
2. Is each number tied to a period, scope, and source?
3. Does the annotation explain a relationship rather than decorate it?
4. Could the same scene render offline if optional assets fail?
