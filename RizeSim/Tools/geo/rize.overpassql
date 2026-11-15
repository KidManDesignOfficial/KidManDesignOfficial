/*
  Rize merkez için OSM verisi. https://overpass-turbo.eu adresine yapıştırıp
  "Dışa aktar → ham OSM verisi" ile rize_merkez.osm olarak kaydedin, ya da:

    curl -o Tools/cache/rize_merkez.osm --data-urlencode data@Tools/geo/rize.overpassql \
         https://overpass-api.de/api/interpreter

  Sınır kutusu Tools/geo/rize_geo.py → REGIONS["merkez"].bbox() ile aynıdır
  (güney, batı, kuzey, doğu).
*/
[out:xml][timeout:180][bbox:40.99479,40.48871,41.04521,40.55529];
(
  way[highway];
  way[building];
  way["building:part"];
  way[natural=coastline];
  way[natural=water];
  way[waterway];
  way[landuse];
  way[leisure];
  way[amenity];
  way[shop];
  way[power~"^(line|minor_line)$"];
  way[barrier];
  way[man_made~"^(pier|breakwater|bridge)$"];
  node[highway~"^(street_lamp|bus_stop|traffic_signals|crossing)$"];
  node[amenity];
  node[shop];
  node[power~"^(pole|tower)$"];
  node[natural=tree];
  node["manhole"];
  relation[building];
  relation[type=multipolygon][landuse];
);
(._;>;);
out body;
