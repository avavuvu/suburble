import time
import geopandas

myshpfile = geopandas.read_file('PTV/PTV_TRAIN_CORRIDOR_CENTRELINE.shp')
myshpfile.to_file(f"output_{time.time()}.json", driver='GeoJSON')