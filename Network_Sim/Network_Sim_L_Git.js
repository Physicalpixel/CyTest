var elements1;
var node;
var removed = [];
var x;
var silos = [];
var s = [{ data: 1 }, { data: 2 }];
s.push({ data: 3 });
//console.log(s);
var ele_re;
var collection = [];

document.addEventListener("DOMContentLoaded", function () {
  var startTime = performance.now();

  var cy = (window.cy = cytoscape({
    container: document.getElementById("cy"),
    //initilisation options
    hideEdgesOnViewport: true,

    layout: {
      name: "cose-bilkent",
      randomize: true,
    },

    style: [
      {
        selector: "node",
        style: {
          "background-color": function (ele) {
            var cut = ele["data"]()["Cut_point"];
            if (ele.id() == 9085 || ele.id() == 8401) {
              return "red";
            } else if (ele.degree() == 0) {
              return "green";
            }
            return "grey";
          },
          ["label"]: function (ele) {
            return ele.id();
          },
        },
      },

      {
        selector: "edge",
        style: {
          "line-color": "#126814",
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
        //console.log(data["graph"]["elements"]);
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

  cy.on("tap", "node", function (evt) {
    node = evt.target;
    console.log("node to remove: " + node.id());
    cy.remove(node);
    var silo = node.data("Impacted_Nodes");

    silo.forEach(function (ele) {
      var each_ele = cy.$id(ele);
      silo_removed = cy.remove(each_ele);
      silo_removed.forEach(function (r_n) {
        var removed_ele = r_n.data();
        collection.push({ data: removed_ele });
      });
    });
    //console.log(collection);

    var data_edit = cy.json();
    elements1 = data_edit["elements"];
    var isolates = cy.elements("node[[degree =0]]");
    console.log(isolates);

    var isolate_removed = cy.remove(isolates);
    isolate_removed.forEach(function (r_n) {
      var removed_ele = r_n.data();
      collection.push({ data: removed_ele });
    });

    var x = cy.nodes().filter(function (ele) {
      return ele.data("Impacted_By") == node.id();
    });
    var x;

    var cy1 = (window.cy1 = cytoscape({
      container: document.getElementById("cy1"),
      hideEdgesOnViewport: true,

      style: [
        {
          selector: "node",
          style: {
            "background-color": "#126814",
            ["label"]: function (ele) {
              return ele._private.data["id"];
            },
          },
        },

        {
          selector: "edge",
          style: {
            "line-color": "#126814",
            opacity: 0.5,
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#126814",
            "curve-style": function () {
              return "haystack";
            },
          },
        },
      ],

      // elements: fetch('./data/planar-chain.json').then(function( res ){ return res.json(); })

      elements: collection,

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
      })
      .run();
  });
});
