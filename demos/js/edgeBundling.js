function createBundlingData(rawData) {
    const nodes = rawData.nodes;
    const links = rawData.links;
    //const width = window.innerWidth;
    const width = 1200;
    const height = window.innerHeight;
    const hypotenuse = Math.sqrt(width * width + height * height);
    const innerScale = function (value) {
        const domain = [0, hypotenuse];
        const range = [1, 15];
        return linear(value, range, domain);
    };

    const bundleData = { nodes: [], links: [], paths: [] };
    bundleData.nodes = nodes;
    links.forEach(link => {
        const length = distance(link.source, link.target);
        const total = Math.round(innerScale(length));
        const xScale = function (value) {
            const domain = [0, total + 1];
            const range = [link.source.x, link.target.x];
            return linear(value, range, domain);
        };
        const yScale = function (value) {
            const domain = [0, total + 1];
            const range = [link.source.y, link.target.y];
            return linear(value, range, domain);
        };
        let source = link.source;
        let target = null;
        const local = [source];
        for (let j = 0; j <= total; j++) {
            target = {
                x: xScale(j),
                y: yScale(j)
            };
            local.push(target);
            bundleData.nodes.push(target);

            bundleData.links.push({
                source: source,
                target: target
            });

            source = target;
        }
        local.push(link.target);
        // add last link to target node
        bundleData.links.push({
            source: target,
            target: link.target
        });
        bundleData.paths.push(local);

    });//end of links loop
    return bundleData;
}

function bundlingEdge(data, container) {
    const line = d3.linkVertical()
        //.curve(d3.curveBundle)
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; });

    const links = container.append("g").attr("id", "test")
        .selectAll("path.test")
        .data(data.links)
        .enter()
        .append("path")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", function(d){return d.color;})
        .style("stroke-width", 2)
        .style("stroke-opacity", 0.5);
    const layout = d3.forceSimulation()
        .alphaDecay(0.05)
        .force("charge", d3.forceManyBody()
            .strength(10)
            .distanceMax(100)
        )
        .force("link", d3.forceLink()
            .strength(0.8)
            .distance(0)
        )
        .on("tick", function (d) {
            //links.attr("d", line);
        })
        .on("end", function (d) {
            //console.log("Layout complete!");
            links.attr("d", line);
        });
    layout.nodes(data.nodes);
}

/*------ assistance methods --------*/
function distance(source, target) {
    const dx2 = Math.pow(target.x - source.x, 2);
    const dy2 = Math.pow(target.y - source.y, 2);
    return Math.sqrt(dx2 + dy2);
}

function linear(value, range, domain) {
    return range[0] + (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]);
}