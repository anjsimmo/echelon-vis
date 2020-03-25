#!/usr/bin/env python3
import os

DIR = os.path.dirname(os.path.realpath(__file__))

# Convert ds from numeric to nominal based on thresh
import json
with open(os.path.join(DIR, "traffic-data-full.json")) as f:
    jsonobj = json.load(f)

for hub in jsonobj["hubs"]:
    hub["t"] = hub["ct"]
    for arm in hub["arms"]:
       arm["sat"] = "oversaturated" if arm["ds"] >= 100 else "undersaturated"
       arm["details1"] = {"sat": arm["sat"]}
       arm["details2"] = {"flow": arm["flow"]}
       arm["t"] = arm["pt"]

print(json.dumps(jsonobj))