var elements1;
var node; // to store details node which the user clicks on
var critical_nodes = [
  11389, 11342, 11439, 11438, 11384, 11376, 11476, 11377, 11455, 11456, 11393,
  11410, 11474, 11351, 11488, 11401, 11441, 11400, 11392, 11396, 11479, 11371,
  11435, 11444, 11354, 11353,
];
var iso_count_before = 46;
var iso_count_after = 0;
var collection = []; // to store the cy collection generated after removing   the node

document.addEventListener("DOMContentLoaded", function () {
  var startTime = performance.now();
  document.getElementById("isocount").innerHTML = iso_count_before;
  var cy = (window.cy = cytoscape({
    container: document.getElementById("cy"),
    //initilisation options
    hideEdgesOnViewport: true, // to imprve the performance of the graph while interacting with it (zoom amd drag, edges gets hidden)

    layout: {
      name: "cose-bilkent",
      randomize: true,
      nodeRepulsion: 9500,
      // Ideal edge (non nested) length
      idealEdgeLength: 150,
      // Divisor to compute edge forces
      edgeElasticity: 0.008,
      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 0.001,
      // Gravity force (constant)
      gravity: 1,
      tilingPaddingVertical: 60,
      // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingHorizontal: 60,
      // Gravity range (constant) f
    },

    style: [
      {
        selector: ".hidden",
        css: {
          display: "none",
        },
      },
      {
        selector: "node",
        style: {
          "background-color": function (ele) {
            if (critical_nodes.includes(+ele.id()) == true) {
              return "#ff9999";
            } else if (ele.degree() == 0) {
              // marking isolates by green as  with degree =0
              return "grey";
            }
            return "#a4ca84";
          },
          width: function (ele) {
            if (critical_nodes.includes(+ele.id()) == true) {
              return 55;
            } else {
              return 30;
            }
          },
          height: function (ele) {
            if (critical_nodes.includes(+ele.id()) == true) {
              return 55;
            } else {
              return 30;
            }
          },

          ["label"]: function (ele) {
            return ele._private.data.first_name;
          },
          "font-size": 30,
        },
      },

      {
        selector: "edge",
        style: {
          width: 0.5,
          "line-color": "black",
          opacity: 0.5,
          "target-arrow-shape": "triangle",
          "target-arrow-color": "#126814",
          "curve-style": function () {
            return "haystack";
          },
        },
      },
    ],

    elements: fetch("data_RQ.json")
      .then(function (res) {
        return res.json();
      })
      .then((data) => {
        return data["graph"]["elements"];
      }),

    ready: function () {
      console.log("Rendered CY");
      var endTime = performance.now();
      console.log(
        `Call to doSomething took ${endTime - startTime} milliseconds`
      );
    },
  }));
  var removed = [];
  var node_s = [];
  var node = [];
  //**** cy.remove removes nodes and its associated edges. when we fetch the data of the same, we get edge and node details.****
  /////*************************************************************************************************************************** */
  cy.on("tap", "node", function (evt) {
    collection = [];
    node = evt.target;
    var id = node.id();

    if (critical_nodes.includes(+node.id())) {
      node_s.push(node);
      node.toggleClass("hidden");
      console.log(node.id());

      console.log("node removed: " + node.id());

      var impacted_nodes = node.data("Impacted_Nodes"); // getting the array of impacted nodes of the clicked nodes.
      var silo = node.data("nr_silo_count") - 1;
      var iso = node.data("nr_isolate_count") - 19;
      var rq = node.data("nr_rq").toFixed(5);

      document.getElementById("silocount").innerHTML = silo;
      document.getElementById("isocount").innerHTML = iso;
      document.getElementById("rq").innerHTML = rq;

      impacted_nodes.forEach(function (ele) {
        var each_ele = cy.$id(ele);
        var edge_data = each_ele._private.edges;
        edge_data.forEach(function (d) {
          if (
            d._private.data.source != node.id() &&
            d._private.data.target != node.id()
          ) {
            console.log(d._private.data);
            collection.push({ data: d._private.data });
          }
        });
        collection.push({ data: each_ele.data() });
        node_s.push(each_ele);
        each_ele.toggleClass("hidden");
      });
      node_s.forEach(function (node) {
        if (node.connectedEdges().hidden()) {
          node.toggleClass("hidden");
        }
      });

      var cy1 = (window.cy1 = cytoscape({
        container: document.getElementById("cy1"),
        hideEdgesOnViewport: true,

        style: [
          {
            selector: "node",
            style: {
              "background-color": "#ff9999",
              ["label"]: function (ele) {
                return ele._private.data.first_name;
              },
              width: 5,
              height: 5,
              "font-size": 5,
            },
          },

          {
            selector: "edge",
            style: {
              width: 0.5,
              "line-color": "#ff9999",
              opacity: 1,
              "target-arrow-shape": "triangle",
              "target-arrow-color": "#126814",
              "curve-style": function () {
                return "haystack";
              },
            },
          },
        ],

        elements: collection, // data here is the collection made with removed elements (silos and isolates)

        ready: function () {
          console.log("Rendered CY1");
          var endTime = performance.now();
          console.log(
            `Call to doSomething took ${endTime - startTime} milliseconds`
          );
        },
      }));
      cy1
        .layout({
          name: "cose-bilkent",
          animate: false,
          fit: true,
          // Padding on fit
          padding: 2,
          // Whether to enable incremental mode
          randomize: false,
          // Node repulsion (non overlapping) multiplier
          nodeRepulsion: 4500,
          // Ideal edge (non nested) length
          idealEdgeLength: 50,
          // Divisor to compute edge forces
          edgeElasticity: 0.0009,
          // Nesting factor (multiplier) to compute ideal edge length for nested edges
          nestingFactor: 0.1,
          // Gravity force (constant)
          gravity: 1,
          // Maximum number of iterations to perform
          numIter: 0,
          tile: true,
          // Type of layout animation. The option set is {'during', 'end', false}
          animate: false,
          // Duration for animate:end
          animationDuration: 500,
          // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
          tilingPaddingVertical: 40,
          // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
          tilingPaddingHorizontal: 40,
          gravityRangeCompound: 1.5,
          // Gravity force (constant) for compounds
          gravityCompound: 1.0,
          // Gravity range (constant)
          gravityRange: 3.8,
          // Initial cooling factor for incremental layout
          initialEnergyOnIncremental: 0.5,
        })
        .run();
    }
  });
});
