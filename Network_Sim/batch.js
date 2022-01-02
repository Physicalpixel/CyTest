var elements1;
var node;
var removed = [];
var x;
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
            if (cut == 1 && ele.id() != 11266 && ele.id() != 11292) {
              return "blue";
            } else if (ele.id() == 11292 || ele.id() == 11266) {
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

    elements: fetch("main_personal_impact.json")
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

  cy.on("tap", "node", function (evt) {
    node = evt.target;
    console.log("node to remove: " + node.id());
    cy.remove(node);
    removed.push(+node.id());
    console.log(removed);
    var data_edit = cy.json();
    elements1 = data_edit["elements"];

    var x = cy.nodes().filter(function (ele) {
      //console.log(node.id());
      return ele.data("Impacted_By") == node.id();
    });
    // console.log(x);
    /*if (node.removed()) {
      var x = elements.nodes.splice(node, 1);
      
    }*/
    var cy1 = (window.cy1 = cytoscape({
      container: document.getElementById("cy1"),
      hideEdgesOnViewport: true,

      style: [
        {
          selector: "node",
          style: {
            visibility: function (ele) {
              console.log(removed);
              var imp = ele._private.data["Impacted_By"];
              var status = removed.includes(imp);
              if (status == true) {
                return "visible";
              } else {
                return "hidden";
              }
            },

            "background-color": "#126814",
            ["label"]: function (ele) {
              //console.log(ele);
              return ele.id();
            },
          },
        },

        {
          selector: "edge",
          style: {
            visibility: function (ele) {
              console.log(ele._private.data["target"]);
            },
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

      elements: elements1,

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
      })
      .run();
  });
});
