window.addEventListener("DOMContentLoaded", async (event) => {
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json`
  );
  const mapJson = await res.json();
  map(mapJson);

  // Load the habitat GeoJSON data
  const habitatRes = await fetch("habitat.geojson");
  const habitatJson = await habitatRes.json();

  // Log the habitat data to ensure it's loaded correctly
  console.log(habitatJson);

  // Add the habitat polygons to the map
  const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);

  // Create a separate layer for the habitat polygons
  const habitatLayer = d3.select("svg").append("g").attr("class", "habitat");

  const habitat = habitatLayer
    .selectAll("polygon")
    .data(habitatJson.features)
    .join("polygon")
    .attr("points", (d) => {
      return d.geometry.coordinates[0]
        .map((coord) => {
          const projected = projection(coord);
          return projected ? projected.join(",") : null;
        })
        .join(" ");
    })
    .attr("fill", "green")
    .attr("stroke", "none");

  // Log the habitat elements to ensure they are appended correctly
  console.log(habitat);
});

function map(mapdata) {
  const width = 675,
    height = 210;

  // Create an svg element to hold our map, and set it to the proper width and
  // height. The viewBox is set to a constant value because the projection we're
  // using is designed for that viewBox size:
  // https://github.com/topojson/us-atlas#us-atlas-topojson
  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, 975, 610])
    .attr("style", "width: 100%; height: auto; height: intrinsic;");

  // Create the US boundary
  const usa = svg
    .append("g")
    .append("path")
    .datum(topojson.feature(mapdata, mapdata.objects.nation))
    .attr("d", d3.geoPath());

  // Create the state boundaries. "stroke" and "fill" set the outline and fill
  // colors, respectively.
  const state = svg
    .append("g")
    .attr("stroke", "#444")
    .attr("fill", "#fff")
    .selectAll("path")
    .data(topojson.feature(mapdata, mapdata.objects.states).features)
    .join("path")
    .attr("vector-effect", "non-scaling-stroke")
    .attr("d", d3.geoPath());
}
