#!/usr/bin/env python3

"""
Analyse Albatross GPS tracking data and output results
"""

import json
import sys
import requests
import time
import os
from bs4 import BeautifulSoup

DIR = os.path.dirname(os.path.realpath(__file__))

with open(os.path.join(DIR, "trajectory-albatross.gpx")) as f:
    xml_str = f.read()

defs = []
results = []

obj = BeautifulSoup(xml_str, 'xml')
trks = obj.find_all('trk')
for trk in trks:
    name = trk.find('name').string

    # first 10 chars of timestamp are yyyy-mm-dd
    release_timestamp = trk.find('trkpt').find('time').string
    release_date = "y" + release_timestamp[:4] + "m" + release_timestamp[5:7] + "d" + release_timestamp[8:10]

    defs.append({
      'id': int(name),
      'name': name,
      'albatross_info': {
         "release_date": release_date
       },
      'extras': {},
      'location': []
    })
    for pt in trk.find_all('trkpt'):
        lat = pt['lat']
        lon = pt['lon']
        timestamp = pt.find('time').string
        results.append({
          'id': int(name),
          'location': {
            'longitude': float(lon),
            'latitude': float(lat),
            'timestamp': timestamp
          }
        })

if len(sys.argv) > 1:
    MODE = sys.argv[1]
else:
    MODE = "api"

# find def that matches id
def find_def(id):
    for d in defs:
        if d['id'] == id:
            return d

if MODE == "json":
    for i, r in enumerate(results):
        if i%10 == 0:
            d = find_def(r['id'])
            d['location'].append(r['location'])
    print(json.dumps(defs))
    exit()

for d in defs:
    if MODE == "api":
        print(json.dumps(d, indent=4, separators=(',', ': ')))
        response = requests.post("http://localhost:3000/api/tracking/adduser", json=d)
    else:
        print(json.dumps(d))

if MODE == "api":
    time.sleep(4.0)

# sort by time
results = sorted(results, key=lambda r: r['location']['timestamp'])
for i, r in enumerate(results):
    if i%10 == 0:
        if MODE == "api":
            print(json.dumps(r, indent=4, separators=(',', ': ')))
            response = requests.post("http://localhost:3000/api/tracking/adduserlocation", json=r)
            time.sleep(0.1)
        else:
            print(json.dumps(r))

