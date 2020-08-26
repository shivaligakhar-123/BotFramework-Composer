function initialize(registration) {
  const plugin = {
    customDescription: 'Publish bot to Power Virtual Agents (Preview)',
    hasView: true /** we have custom UI to host */,
    history: getHistory,
  };
  registration.addPublishMethod(plugin);
}

async function getHistory(config, project, user) {
  return [];
}

module.exports = {
  initialize,
};
