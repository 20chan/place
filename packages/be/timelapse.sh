#/bin/bash

ffmpeg -framerate 10 -pattern_type glob -i "backups/*.png" -c:v libx264 -crf 0 output.mp4
