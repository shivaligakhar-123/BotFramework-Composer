function initialize(registration) {
  const plugin = {
    history: getHistory,
  };
  registration.addPublishMethod(plugin, null, null, true /** we have custom UI to host */);
}

async function getHistory(config, project, user) {
  return [];
}

module.exports = {
  initialize,
};
