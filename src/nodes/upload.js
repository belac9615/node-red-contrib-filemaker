module.exports = function(RED) {
  function upload(config) {
    const { compact, merge, sanitize } = require("../services");
    RED.nodes.createNode(this, config);
    const node = this;
    const { client, ...configuration } = config;
    node.connection = RED.nodes.getNode(client);
    node.on("input", async msg => {
      const { layout, field, file, recordId, parameters } = compact([
        sanitize(configuration, ["file", "layout", "field"]),
        msg.parameters,
        msg.payload
      ]);
      let connection = await this.connection.client;
      connection
        .upload(file, layout, field, recordId, parameters)
        .then(response => node.send(merge(msg, response)))
        .catch(error => node.error(error.message, msg));
    });
  }
  RED.nodes.registerType("upload-file", upload);
};
