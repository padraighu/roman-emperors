import pandas as pd
import requests
import json
import numpy as np

emperors_url = 'https://raw.githubusercontent.com/padraighu/emperors/master/emperors.csv'
emperors = pd.read_csv(emperors_url, encoding='latin').replace({np.nan: None}) # ha!
emperors['reign.start'] = pd.to_numeric(emperors['reign.start'].str.slice(0, 4)) # keep year
emperors.loc[0,'reign.start'] = -1 * emperors.loc[0,'reign.start'] # Octavian's reign begins in BC
emperors['reign.end'] = pd.to_numeric(emperors['reign.end'].str.slice(0, 4))
emperors = emperors[['index', 'name', 'birth.cty', 'birth.prv', 'birth.cty.now', 'birth.state.now', 'birth.long', 'birth.lat', 'reign.start', 'reign.end', 'notes']]
emperors_json = emperors.to_dict(orient='records')

from geojson import Point, Feature, FeatureCollection, load, dump
by_city = {}
for e in emperors_json:
    if e['birth.cty'] in by_city:
        by_city[e['birth.cty']].append(e)
    else:
        by_city[e['birth.cty']] = [e]

by_province = {}
for e in emperors_json:
    if e['birth.prv'] in by_province:
        by_province[e['birth.prv']].append(e)
    else:
        by_province[e['birth.prv']] = [e]
print([(p, len(by_province[p])) for p in by_province])
print(by_province.keys())

with open('./provinces_merged.geojson', 'r') as f:
    provinces = json.load(f)
prov_names = [p['properties']['name'] for p in provinces['features']]
print(prov_names)

left_out_p = [p for p in by_province.keys() if p not in prov_names]
print('left out provinces: ', left_out_p)

for p in provinces['features']:
    if p['properties']['name'] in by_province:
        p['properties']['emperors.cnt'] = len(by_province[p['properties']['name']])
        p['properties']['emperors'] = [{k: emp[k] for k in ['index', 'name', 'reign.start', 'reign.end', 'notes']} for emp in by_province[p['properties']['name']]]
    else:
        p['properties']['emperors.cnt'] = 0
        p['properties']['emperors'] = []

with open('./provinces_final.geojson', 'w') as f:
    dump(provinces, f)

features = []

for c in by_city:
    e = by_city[c][0]
    if e['birth.lat'] is not None:
        p = Point((e['birth.lat'], e['birth.long']))
        prop = {
            'city.old': e['birth.cty'],
            'prov.old': e['birth.prv'],
            'city.now': e['birth.cty.now'],
            'state.now': e['birth.state.now'],
            'emperor.cnt': len(by_city[c]),
            'emperors': [{k: emp[k] for k in ['index', 'name', 'reign.start', 'reign.end', 'notes']} for emp in by_city[c]]
        }
        f = Feature(geometry=p, properties=prop)
        features.append(f)

collection = FeatureCollection(features)
with open('./city.geojson', 'w') as f:
    dump(collection, f)