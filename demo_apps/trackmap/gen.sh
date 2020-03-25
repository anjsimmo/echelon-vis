#!/bin/bash

mkdir -p client/public/out

ECH='../../echelon'
DATA='../../demo_data'
OUT='client/public/out'

$DATA/animals/analyse.py json > $OUT/albatross-data.json
$ECH/generate_notation $DATA/animals/albatross-schema.json albatross-grammar.json
mv generated_transformation.json $OUT/albatross-transformation.json
mv generated_notation.html $OUT/albatross-notation.html

$ECH/generate_notation $DATA/indoor/indoor-schema.json indoor-grammar.json
mv generated_transformation.json $OUT/indoor-transformation.json
mv generated_notation.html $OUT/indoor-notation.html
