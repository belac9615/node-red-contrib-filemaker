module.exports = function(RED) {
  function upload(config) {
    const { send, handleError, constructParameters } = require("../services");
    const { client, output, ...configuration } = config;
    RED.nodes.createNode(this, config);
    const node = this;

    node.status({ fill: "blue", shape: "dot", text: "Loading" });
    node.handleEvent = ({ connected, message }) =>
      node.status(
        connected
          ? { fill: "green", shape: "dot", text: message }
          : { fill: "red", shape: "dot", text: message }
      );

    node.client = RED.nodes.getNode(client);
    node.client.on("status", node.handleEvent);

    node.on("input", async message => {
      node.status({ fill: "yellow", shape: "dot", text: "Processing" });
      const {
        layout,
        field,
        file,
        recordId,
        ...parameters
      } = constructParameters(message, configuration, node.context(), [
        "file",
        "layout",
        "field",
        "recordId",
        "parameters"
      ]);
      const client = await this.client.connection;
      client
        ? client
            .upload(file, layout, field, recordId, parameters)
            .then(response => send(node, output, message, response))
            .catch(error => handleError(node, error.message, message))
        : handleError(node, "Failed to load DAPI client.", message);
    });

    node.on("close", () =>
      node.client.removeListener("status", node.handleEvent)
    );
  }
  RED.nodes.registerType("dapi-upload-file", upload);
};
