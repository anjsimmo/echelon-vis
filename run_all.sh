#!/bin/bash

SCRIPT=$(readlink -f "$0")
DIR=$(dirname "$SCRIPT")

# load conda environment
source ~/.bashrc

cd "$DIR"/demo_apps/hubmap
./gen.sh
python3 -m http.server > /dev/null 2>&1 &

cd "$DIR"/demo_apps/trackmap
./gen.sh
cd client
npm start > /dev/null 2>&1 &
cd ../server
npm start > /dev/null 2>&1 &

cd "$DIR"
cat echelon/README

# Run an interactive Bash shell
exec /bin/bash

