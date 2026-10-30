import ast
import json
import math
import re
from datetime import datetime
from pathlib import Path

root = Path(__file__).resolve().parents[6]
errors = []

def load(rel):
    with (root / rel).open(encoding='utf-8') as stream:
        return json.load(stream)

def require(condition, message):
    if not condition:
        errors.append(message)

def valid_number(value):
    return type(value) in (int, float) and math.isfinite(value)

# Validate existing generated address-to-block JSON, without running the generator.
blocks = load('geo-data/out/melbourne_cbd_street_blocks.json')
meta = blocks.get('metadata', {})
streets = blocks.get('streets', {})
require(meta.get('area') == 'Melbourne CBD (Spencer-Spring, Flinders-La Trobe)', 'unexpected address output area metadata')
bbox = meta.get('bbox', {})
require(all(valid_number(bbox.get(k)) for k in ('west', 'south', 'east', 'north')), 'invalid address output bbox')
require(bbox.get('west', 999) < bbox.get('east', -999) and bbox.get('south', 999) < bbox.get('north', -999), 'inverted address output bbox')
require(isinstance(streets, dict) and bool(streets), 'address output has no street records')
allowed_sides = {'north_side', 'south_side', 'east_side', 'west_side', 'unknown'}
street_count = len(streets) if isinstance(streets, dict) else 0
block_count = number_count = unknown_side_groups = empty_number_groups = 0
for street, street_blocks in streets.items() if isinstance(streets, dict) else []:
    require(isinstance(street, str) and bool(street.strip()), 'blank street key')
    require(isinstance(street_blocks, dict) and bool(street_blocks), f'empty blocks: {street!r}')
    for block, sides in street_blocks.items() if isinstance(street_blocks, dict) else []:
        block_count += 1
        require(isinstance(block, str) and block.startswith('between_'), f'invalid block key: {block!r}')
        require(isinstance(sides, dict) and bool(sides), f'empty side map: {street}/{block}')
        for side, numbers in sides.items() if isinstance(sides, dict) else []:
            require(side in allowed_sides, f'unknown side label: {street}/{block}/{side}')
            unknown_side_groups += side == 'unknown'
            valid = isinstance(numbers, list) and all(type(n) is int and n > 0 for n in numbers)
            require(valid, f'invalid house-number list: {street}/{block}/{side}')
            if isinstance(numbers, list):
                require(numbers == sorted(set(numbers)), f'not sorted/deduplicated: {street}/{block}/{side}')
                number_count += len(numbers)
                empty_number_groups += not bool(numbers)

sample_street = streets.get("A'Beckett Street", {})
sample_block = sample_street.get('between_elizabeth_street_and_queen_street', {})
require(bool(sample_block), 'representative A\'Beckett/Elizabeth-to-Queen assignment absent')
require(bool(sample_block.get('north_side')) and bool(sample_block.get('south_side')), 'representative A\'Beckett side groups absent')

# Validate the local road-asset output and cross-check its area labels against the
# embedded zone catalog. The output has no geometry, so this is label coverage only.
roads = load('geo-data/com_assets_by_area.json')
road_meta = roads.get('metadata', {})
areas = roads.get('areas', {})
require(road_meta.get('jurisdiction') == 'City of Melbourne (CBD)', 'unexpected road output jurisdiction')
require(isinstance(areas, dict) and bool(areas), 'road output has no area records')
if road_meta.get('generated'):
    try:
        datetime.fromisoformat(road_meta['generated'].replace('Z', '+00:00'))
    except (TypeError, ValueError):
        errors.append('invalid road output generated timestamp')

source = (root / 'geo-data/fetch-com-roads.mjs').read_text(encoding='utf-8')
zone_text = source.split('const ZONES = [', 1)[1].split('\n];', 1)[0]
zone_names = set()
zone_point_count = 0
for line in zone_text.splitlines():
    match = re.search(r'id: "([^"]+)", name: "([^"]+)", coords: (\[\[.*\]\]) \}', line)
    if not match:
        continue
    zone_names.add(match.group(2))
    coords = ast.literal_eval(match.group(3))
    require(len(coords) >= 3, f'embedded zone has fewer than 3 points: {match.group(2)}')
    for lat, lon in coords:
        zone_point_count += 1
        require(valid_number(lon) and valid_number(lat), f'non-numeric embedded zone coordinate: {match.group(2)}')
        require(144.94 <= lon <= 144.99 and -37.83 <= lat <= -37.79, f'embedded coordinate outside broad Melbourne CBD guard: {match.group(2)} ({lat}, {lon})')
require(bool(zone_names), 'no embedded zones parsed from active road fetch tool')
require(zone_names == set(areas), f'generated road area names differ from embedded zone names: missing={sorted(zone_names-set(areas))}, extra={sorted(set(areas)-zone_names)}')

road_asset_count = duplicate_signatures = 0
for area, record in areas.items() if isinstance(areas, dict) else []:
    assets = record.get('assets') if isinstance(record, dict) else None
    require(isinstance(assets, list) and bool(assets), f'empty/invalid road assets: {area}')
    signatures = set()
    for asset in assets if isinstance(assets, list) else []:
        road_asset_count += 1
        require(isinstance(asset, dict), f'invalid road asset in {area}')
        require(isinstance(asset.get('name'), str) and bool(asset['name'].strip()), f'missing road name in {area}')
        require(asset.get('type') in {'lane', 'alley', 'arcade', 'court', 'place', 'avenue', 'walk', 'intersection', 'street', 'road'}, f'invalid road type in {area}')
        signature = (asset.get('name', '').casefold(), json.dumps(asset.get('between'), sort_keys=True), asset.get('off'))
        duplicate_signatures += signature in signatures
        signatures.add(signature)
require(duplicate_signatures == 0, f'duplicate asset signatures found: {duplicate_signatures}')

# Validate local small coordinate fixtures for numeric and Melbourne-region plausibility.
def check_local_point(lat, lon, label):
    require(valid_number(lat) and -90 <= lat <= 90, f'invalid latitude: {label}')
    require(valid_number(lon) and -180 <= lon <= 180, f'invalid longitude: {label}')
    require(-37.85 <= lat <= -37.78 and 144.93 <= lon <= 145.00, f'fixture point outside broad Melbourne CBD guard: {label} ({lat}, {lon})')

zones = load('geo-data/data/zones.json')
require(isinstance(zones, list) and bool(zones), 'empty local zones list')
for zone in zones if isinstance(zones, list) else []:
    points = zone.get('coordinates', []) if isinstance(zone, dict) else []
    require(len(points) >= 3, f'zone lacks polygon points: {zone.get("id") if isinstance(zone, dict) else zone!r}')
    for point in points:
        check_local_point(point.get('latitude'), point.get('longitude'), f'zone {zone.get("id")}')
parking = load('geo-data/data/parking-zones.json')
require(isinstance(parking, list), 'invalid parking-zones list')
for zone in parking if isinstance(parking, list) else []:
    coords = zone.get('polygon', []) if isinstance(zone, dict) else []
    require(len(coords) >= 3, f'parking polygon lacks points: {zone.get("name") if isinstance(zone, dict) else zone!r}')
    for lat, lon in coords:
        check_local_point(lat, lon, f'parking {zone.get("name")}')
streets_fixture = load('geo-data/data/streets.json')
require(isinstance(streets_fixture, list), 'invalid local streets list')
for item in streets_fixture if isinstance(streets_fixture, list) else []:
    require(isinstance(item.get('name'), str) and bool(item['name']), 'local street has no name')
    check_local_point(item.get('latitude'), item.get('longitude'), f'street {item.get("name")}')
numbers_fixture = load('geo-data/data/street-numbers.json')
require(isinstance(numbers_fixture, list), 'invalid local street-number list')
for item in numbers_fixture if isinstance(numbers_fixture, list) else []:
    require(isinstance(item.get('street'), str) and bool(item['street']), 'street-number row has no street')
    require(type(item.get('from')) is int and type(item.get('to')) is int and 0 < item['from'] <= item['to'], f'invalid street-number range: {item}')

print(f'address_output: streets={street_count} blocks={block_count} assigned_numbers={number_count} unknown_side_groups={unknown_side_groups} empty_number_groups={empty_number_groups}')
print(f'road_output: generated={road_meta.get("generated")} areas={len(areas)} embedded_zones={len(zone_names)} zone_points={zone_point_count} assets={road_asset_count} duplicate_signatures={duplicate_signatures} area_labels_match=True')
print(f'local_coordinate_fixtures: zones={len(zones)} parking_zones={len(parking)} streets={len(streets_fixture)} street_number_ranges={len(numbers_fixture)}')
print('representative records: A\'Beckett Street / Elizabeth–Queen block has populated north/south arrays; road asset records have valid name/type.')
print('limits: generated address/road outputs contain no source coordinates/raw feature IDs; no offline point-in-polygon or representative spatial-assignment check is possible from retained files.')
print('scope: read-only local JSON/source parsing; no imports of GIS dependencies, external fetch, or product-data writes')
if errors:
    print(f'FAIL: {len(errors)} validation errors')
    for error in errors[:100]:
        print(f'  {error}')
    raise SystemExit(1)
print('PASS: bounded offline structure, embedded-zone coordinate, and representative-record checks')
