module.exports = function(RED) {
  function databases(configuration) {
    const { constructParameters, send, handleError } = require("../services");
    const { client, output } = configuration;

    RED.nodes.createNode(this, configuration);

    const node = this;

    node.client = RED.nodes.getNode(client);
    node.status({ fill: "blue", shape: "dot", text: "Loading" });

    node.handleEvent = ({ connected, message }) =>
      node.status(
        connected
          ? { fill: "green", shape: "dot", text: message }
          : { fill: "red", shape: "dot", text: message }
      );

    node.client.on("status", node.handleEvent);

    node.on("input", async message => {
      node.status({ fill: "yellow", shape: "dot", text: "Processing" });
      const { credentials } = constructParameters(
        message,
        configuration,
        node.context(),
        ["credentials"]
      );

      const client = await this.client.connection;

      client
        ? client
            .databases(credentials)
            .then(response => send(node, output, message, response))
            .catch(error => handleError(node, error.message, message))
        : handleError(node, "Failed to load DAPI client.", message);
    });

    node.on("close", () =>
      node.client.removeListener("status", node.handleEvent)
    );
  }
  RED.nodes.registerType("dapi-databases", databases);
};
