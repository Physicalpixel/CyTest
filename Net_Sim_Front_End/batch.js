var elements1;
var node; // to store details node which the user clicks on
var critical_nodes = [9085, 8401, 8849];
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
    },

    style: [
      {
        selector: "node",
        style: {
          "background-color": function (ele) {
            /*if (ele.degree() == 0) {
              iso_count_before[0] = iso_count_before[0] + 1;
            }
            document.getElementById("isocount").innerHTML =
              iso_count_before[0] - 1;*/

            //var cut = ele["data"]()["Cut_point"]; // to get if the node is cut point of not, this is not relevant for this code.
            if (critical_nodes.includes(+ele.id()) == true) {
              // two sample nodes  taken as cut points. these points
              // are tagged with an array of impacted nodes against "Impacted_Nodes".

              // marking the cutpoints by red.
              return "red";
            } else if (ele.degree() == 0) {
              // marking isolates by green as  with degree =0
              return "grey";
            }
            return "#23395d";
          },
          width: function (ele) {
            if (critical_nodes.includes(+ele.id()) == true) {
              return 85;
            } else {
              return 40;
            }
          },
          height: function (ele) {
            if (critical_nodes.includes(+ele.id()) == true) {
              return 85;
            } else {
              return 40;
            }
          },

          ["label"]: function (ele) {
            return ele.id();
          },
          "font-size": 30,
        },
      },

      {
        selector: "edge",
        style: {
          "line-color": "grey",
          opacity: 0.5,
          "target-arrow-shape": "triangle",
          "target-arrow-color": "#126814",
          "curve-style": function () {
            return "haystack";
          },
        },
      },
    ],

    elements: fetch("Large_graph_impact.json")
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

  //**** cy.remove removes nodes and its associated edges. when we fetch the data of the same, we get edge and node details.****
  /////*************************************************************************************************************************** */
  cy.on("tap", "node", function (evt) {
    // when the user clicks on a node
    node = evt.target; //getting the target node which was clicked.
    console.log("node to remove: " + node.id());
    if (critical_nodes.includes(+node.id())) {
      cy.remove(node);

      // removing its node and edges pertaining to the same.
      var silo = node.data("Impacted_Nodes"); // getting the array of impacted nodes of the clicked nodes.

      silo.forEach(function (ele) {
        // for every element in the silos array
        var each_ele = cy.$id(ele); // from cy collection get all the elements which matches the element id in silos array.

        silo_removed = cy.remove(each_ele); // remove all the matching silo elements from the first graph.
        silo_removed.forEach(function (r_n) {
          //for each removed silo element
          var removed_ele = r_n.data(); //get the data of every removed silo element.
          collection.push({ data: removed_ele }); //store the data of all the removed node in new collection which will be used to
          //render sub graph in the second canvas.
        });
      });
      /*var data_edit = cy.json();
    elements1 = data_edit["elements"];*/
      var isolates = cy.elements("node[[degree =0]]");
      // getting all the isolated node.
      var isolate_removed = cy.remove(isolates); // removed all isolated nodes fro the first graph.
      isolate_removed.forEach(function (r_n) {
        // for every removed isolated node
        var removed_ele = r_n.data(); //get the data of every removed isolated node
        collection.push({ data: removed_ele });

        //adding the removed elememt data to to the collection which will be used to
        //render sub graph in the second canvas.
      });

      var silo_count = [];
      collection.forEach(function (d) {
        var number = d["data"]["Impacted_By"];
        if (silo_count.includes(number) == false) {
          silo_count.push(number);
        }
      });

      iso_count_after = iso_count_after + isolates.length;
      console.log(iso_count_after);

      document.getElementById("isocount").innerHTML = iso_count_after;

      document.getElementById("silocount").innerHTML = silo_count.length - 2;

      /*var x = cy.nodes().filter(function (ele) {
      return ele.data("Impacted_By") == node.id();
    });
    var x;*/

      var cy1 = (window.cy1 = cytoscape({
        // drawing graph for second node
        container: document.getElementById("cy1"),
        hideEdgesOnViewport: true,

        style: [
          {
            selector: "node",
            style: {
              "background-color": "#ff9999",
              ["label"]: function (ele) {
                return ele._private.data["id"];
              },
              width: 10,
              height: 10,
            },
          },

          {
            selector: "edge",
            style: {
              width: 1,
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

        // elements: fetch('./data/planar-chain.json').then(function( res ){ return res.json(); })

        elements: collection, // data here is the collection made with removed elements (silos and isolates)

        ready: function () {
          console.log("Rendered CY1");
          var endTime = performance.now();
          console.log(
            `Call to doSomething took ${endTime - startTime} milliseconds`
          );
        },
      }));
      /*********** since the new render is with very less data, this gives us flexibility of using complex layouts  for the second canvas*************/ /////
      //************************************************************************************************************************************** */
      cy1
        .layout({
          name: "cose-bilkent",
          animate: false,
          fit: true,
          // Padding on fit
          padding: 20,
          // Whether to enable incremental mode
          randomize: false,
          // Node repulsion (non overlapping) multiplier
          nodeRepulsion: 5500,
          // Ideal edge (non nested) length
          idealEdgeLength: 100,
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
