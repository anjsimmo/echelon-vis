#!/bin/bash

mkdir -p out

ECH='../../echelon'
DATA='../../demo_data'
OUT='out'

$DATA/traffic/preprocess_traffic.py > $OUT/traffic-data.json
$ECH/generate_notation $DATA/traffic/traffic-schema.json hubmap-grammar.json
mv generated_transformation.json $OUT/traffic-transformation.json
mv generated_notation.html $OUT/traffic-notation.html
$ECH/use_notation $OUT/traffic-data.json $OUT/traffic-transformation.json > $OUT/traffic-rendered.json

$DATA/airport/preprocess_airport.py > $OUT/airport-data.json
$ECH/generate_notation $DATA/airport/airport-schema.json hubmap-grammar.json
mv generated_transformation.json $OUT/airport-transformation.json
mv generated_notation.html $OUT/airport-notation.html
$ECH/use_notation $OUT/airport-data.json $OUT/airport-transformation.json > $OUT/airport-rendered.json
