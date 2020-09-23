import { IBotProject } from '@bfc/shared';

const API_VERSION = '1';
//const BASE_URL = `https://powerva.microsoft.com/api/botmanagement/v${API_VERSION}`; // prod / sdf
const BASE_URL = `https://bots.int.customercareintelligence.net/api/botmanagement/v${API_VERSION}`; // int / ppe
const auth = {
  clientId: 'ce48853e-0605-4f77-8746-d70ac63cc6bc',
  scopes: ['a522f059-bb65-47c0-8934-7db6e5286414/.default'], // int / ppe
};

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

const publish = async (
  config: PublishConfig,
  project: IBotProject,
  metadata,
  user,
  { getAccessToken, loginAndGetIdToken }
) => {
  const {
    // these are provided by Composer
    profileName, // the name of the publishing profile "My PVA Prod Slot"

    // these are specific to the PVA publish profile shape
    botId,
    envId,
    tenantId,
    deleteMissingComponents, // publish behavior
  } = config;
  const { comment = '' } = metadata;

  const url = `${BASE_URL}/environments/${envId}/bots/${botId}/composer/publishoperations?deleteMissingComponents=${deleteMissingComponents}&comment=${encodeURIComponent(
    comment
  )}`;
  try {
    const idToken = await loginAndGetIdToken(auth);
    const accessToken = await getAccessToken({ ...auth, idToken });
    console.log('got token: ', accessToken);
    let res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-CCI-TenantId': tenantId,
        'X-CCI-Routing-TenantId': tenantId,
      },
    });
    res = await res.json();

    // const response = {
    //   status: '',
    //   result: {
    //     id: '',
    //     time: '',
    //     message: 'Publish accepted.',
    //     log: '',
    //     comment: '',
    //   },
    // };
    // return response;
    return res;
  } catch (e) {
    return {
      status: 500,
      result: {
        message: e.message,
      },
    };
  }
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
