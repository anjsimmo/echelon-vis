#!/usr/bin/env python3
import pandas as pd
import pyproj
import json
import os

DIR = os.path.dirname(os.path.realpath(__file__))

airports = pd.read_csv(os.path.join(DIR, "airports.csv"))
airports_o = airports.rename(columns=lambda x: x + "_o")
airports_d = airports.rename(columns=lambda x: x + "_d")
od = pd.read_csv(os.path.join(DIR, "flights-airport.csv"))
od_d = pd.merge(od, airports_d, how='inner', left_on=['destination'], right_on=['iata_d'])
od_od = pd.merge(od_d, airports_o, how='inner', left_on=['origin'], right_on=['iata_o'])

# https://stackoverflow.com/questions/54873868/python-calculate-bearing-between-two-lat-long/54874251#54874251
# (use pyproj)
# Note that lat, lng seem to be the wrong way around on stack overflow answer
geodesic = pyproj.Geod(ellps='WGS84')
fwd_azimuth,back_azimuth,distance = geodesic.inv(list(od_od["longitude_o"]), list(od_od["latitude_o"]),
                                                 list(od_od["longitude_d"]), list(od_od["latitude_d"]))
od_od["fwd_azimuth"] = fwd_azimuth
od_od["back_azimuth"] = back_azimuth
od_od["distance"] = distance

result = []
for orig, group in od_od.groupby('origin'):
    links = []
    for row_index, link in group.iterrows():
        links.append({'dest': link["destination"],
                      "heading": link["fwd_azimuth"] + 180, #(hubmap uses approach angle, rather than outgoing angle)
                      "details": {
                        "numflights": link["count"]
                      }
                     })

    first_row = group.iloc[0]
    result.append({'airport': orig, 'totalflights': sum(group['count']),
                   'latitude': first_row['latitude_o'], 'longitude': first_row['longitude_o'],
                   'flights': links})

results = {"airports": result}

print(json.dumps(results))
