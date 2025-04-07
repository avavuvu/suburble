import json
import time
from shapely.geometry import shape

def read_geojson_polygon():
    suburbs: list[dict] = []

    with open("../src/geojson/electrified2500km.geojson") as file:
        file_string = file.read()
        obj = json.loads(file_string)

        features: list = obj["features"]

        for feature in features:
            geometry = feature["geometry"]

            if(geometry["type"] == "Point"):
                print("skipping", json.dumps(feature["properties"]["@id"], indent=4))
                continue

            name = feature["properties"]["name"]
            shapely_geom = shape(geometry) 
            centroid = shapely_geom.centroid
            print([centroid.y, centroid.x])

            coordinates = geometry["coordinates"]

            print("adding", name)

            suburbs.append({
                'name': name, 
                'coordinates': coordinates,
                'centroid': [centroid.y, centroid.x]
            })
        
    with open(f"./output_{time.time()}.json", "w") as output:
        output.write(json.dumps(suburbs))

def read_geojson_segments():
    train_lines: list[dict] = []

    with open("./output_trains.json") as file:
        file_string = file.read()
        obj = json.loads(file_string)

        features: list = obj["features"]

        for feature in features:
            geometry = feature["geometry"]
            

            name = feature["properties"]["SEGMENT"]
            coordinates = geometry["coordinates"]

            flattened_coordinates = []
            for coordinate in coordinates:
                if isinstance(coordinate, list) and all(isinstance(sub, list) for sub in coordinate):
                    flattened_coordinates.extend(coordinate)
                else:
                    flattened_coordinates.append(coordinate)

            train_lines.append({
                'name': name, 
                'coordinates': flattened_coordinates,
            })
        
    with open(f"./output_{time.time()}.json", "w") as output:
        output.write(json.dumps(train_lines))

if __name__ == "__main__":
    read_geojson_segments()