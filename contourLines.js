// Set the dimensions of the canvas
const width = window.innerWidth;
const height = window.innerHeight;

// Create SVG element
const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Generate random data points
const points = d3.range(2000).map(() => [Math.random() * width, Math.random() * height]);

// Compute the density data
const contours = d3.contourDensity()
    .x(d => d[0])
    .y(d => d[1])
    .size([width, height])
    .bandwidth(40)
    (points);

// Draw the contours with customized colors
svg.selectAll("path")
    .data(contours)
    .enter().append("path")
    .attr("d", d3.geoPath())
    .attr("stroke", "rgba(255, 255, 255, 0.25)")  // 50% transparent white stroke
    .attr("stroke-width", 1);

// Adjust the SVG size dynamically when resizing the window
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    svg.attr("width", newWidth).attr("height", newHeight);
});