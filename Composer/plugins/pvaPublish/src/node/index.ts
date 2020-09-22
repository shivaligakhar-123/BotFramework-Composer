import { IBotProject } from '@bfc/shared';

interface PublishConfig {
  fullSettings: any;
  profileName: string;
  [key: string]: any;
}

function initialize(registration) {
  const plugin = {
    customDescription: 'Publish bot to Power Virtual Agents (Preview)',
    hasView: true /** we have custom UI to host */,
    history,
    getStatus,
    publish,
    auth: {
      clientId: 'ce48853e-0605-4f77-8746-d70ac63cc6bc',
      scopes: ['a522f059-bb65-47c0-8934-7db6e5286414/.default'], // int / ppe
    },
  };
  registration.addPublishMethod(plugin);
}

interface PublishJob {
  id: number;
  comment?: string;
  complete: boolean;
  lastUpdated: Date;
  link?: { href: string; text: string };
  logMessages: string[];
  message: string;
  status?: number;
  success: boolean;
}

const publish = async (config: PublishConfig, project: IBotProject, metadata, user, accessToken) => {
  const {
    // these are provided by Composer
    profileName, // the name of the publishing profile "My PVA Prod Slot"

    // these are specific to the PVA publish profile shape
    botId,
    envId,
    tenantId,
    deleteMissingDependencies, // publish behavior
  } = config;
  console.log('got access token in plugin: ', accessToken);

  const response = {
    status: '',
    result: {
      id: '',
      time: '',
      message: 'Publish accepted.',
      log: '',
      comment: '',
    },
  };
  return response;
};

const getStatus = async (config: PublishConfig, project: IBotProject, user) => {
  const profileName = config.profileName;
  const botId = project.id;

  return {
    status: '',
    result: {
      id: '',
      link: '',
      log: '',
      time: '',
      message: '',
      comment: '',
    },
  };
};

const history = async (config: PublishConfig, project: IBotProject, user) => {
  const {
    // these are provided by Composer
    profileName, // the name of the publishing profile "My PVA Prod Slot"

    // these are specific to the PVA publish profile shape
    botId,
    envId,
    tenantId,
    deleteMissingDependencies,
  } = config;

  return {
    status: 200,
    result: {},
  };
};

module.exports = {
  initialize,
};
