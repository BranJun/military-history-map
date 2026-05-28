import requests
import json
import time
import re

ENDPOINT = "https://query.wikidata.org/sparql"
HEADERS = {
    'User-Agent': 'Example-Agent',
    'Accept': 'application/json'
}

TYPE_MAP = {
    'Q178561': 'battle',
    'Q1261499': 'naval_battle',
    'Q113782315': 'naval_battle',
    'Q188055': 'siege',
    'Q273976': 'siege',
}

def fetch_all(date_property):
    query = """
    SELECT ?article
           (SAMPLE(?coords) AS ?coords)
           (SAMPLE(?date) AS ?date)
           (GROUP_CONCAT(DISTINCT ?type; separator=",") AS ?types)
    WHERE {{
      ?battle wdt:P31/wdt:P279* wd:Q178561 .
      ?battle wdt:P625 ?coords .
      ?battle wdt:{property} ?date .
      ?article schema:about ?battle .
      ?article schema:isPartOf <https://en.wikipedia.org/> .
      ?battle wdt:P31 ?type .
    }}
    GROUP BY ?article
    """.format(property=date_property)

    response = requests.get(
        ENDPOINT,
        params={'query': query, 'format': 'json'},
        headers=HEADERS,
        timeout=120
    )

    if response.status_code != 200:
        print(f"FAILED {date_property}: {response.status_code}")
        return None

    return response.json()['results']['bindings']


def parse_coords(coords_str):
    parts = coords_str.replace('Point(', '').replace(')', '').split()
    return float(parts[0]), float(parts[1])  # lng, lat


def parse_types(types_str):
    matched = []
    for qid in types_str.split(','):
        qid = qid.strip().split('/')[-1]
        if qid in TYPE_MAP:
            category = TYPE_MAP[qid]
            if category not in matched:
                matched.append(category)
    return matched if matched else ['battle']


def extract_year(date_str):
    if not date_str:
        return None
    # ISO format from Wikidata: 1805-10-21T00:00:00Z or -0331-01-01T00:00:00Z
    match = re.match(r'^(-?)(\d+)-', date_str)
    if match:
        is_bc = match.group(1) == '-'
        year = int(match.group(2))
        return -year if is_bc else year
    return None


def build_geojson(output_path='battles.geojson'):
    print("Fetching P585 (point in time)...")
    p585 = fetch_all('P585')
    time.sleep(2)
    print(f"  Got {len(p585)} results")

    print("Fetching P580 (start time)...")
    p580 = fetch_all('P580')
    print(f"  Got {len(p580)} results")

    # Merge preferring P585
    merged = {b['article']['value']: b for b in p585}
    for b in p580:
        url = b['article']['value']
        if url not in merged:
            merged[url] = b

    print(f"\nTotal unique battles: {len(merged)}")
    print("Building GeoJSON...")

    features = []
    for url, b in merged.items():
        try:
            coords_str = b.get('coords', {}).get('value')
            if not coords_str:
                continue

            lng, lat = parse_coords(coords_str)
            date_str = b.get('date', {}).get('value')
            types = parse_types(b.get('types', {}).get('value', ''))
            year = extract_year(date_str)
            title = url.split('/wiki/')[-1]

            feature = {
                "type": "Feature",
                "properties": {
                    "title": title,
                    "wikipedia_url": url,
                    "date": date_str,
                    "year": year,
                    "types": types
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                }
            }
            features.append(feature)

        except Exception as e:
            print(f"  Skipping {url}: {e}")
            continue

    geojson = {"type": "FeatureCollection", "features": features}

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)

    print(f"\nDone.")
    print(f"  Total features: {len(features)}")
    print(f"  Saved to: {output_path}")


if __name__ == "__main__":
    build_geojson()