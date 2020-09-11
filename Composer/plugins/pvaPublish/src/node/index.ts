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
  };
  registration.addPublishMethod(plugin);
}

interface BotPublishHistory {
  [botId: string]: PublishJobRecord;
}

interface PublishJobRecord {
  [profileName: string]: PublishJob[];
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

const mockPublishCompletionTime = 1000 * 20; // 20 seconds

class PublishJobManager {
  private history: BotPublishHistory;

  constructor() {
    this.history = {};
  }

  public startPublishJob(botId: string, profileName: string, bot: any, env: string, comment?: string): PublishJob {
    const job: PublishJob = {
      id: globalJobId++,
      comment,
      complete: false,
      lastUpdated: new Date(),
      logMessages: [],
      message: 'Publish in progress...',
      success: false,
      status: 202,
    };
    job.logMessages.push(`Publishing started for bot ${bot.name} in environment: ${env}`);

    if (!this.history[botId]) {
      this.history[botId] = {}; // init job record for bot
    }
    if (!this.history[botId][profileName]) {
      // init history for profile name
      this.history[botId][profileName] = [];
    }
    this.history[botId][profileName].push(job);

    // start fake wait for job completion
    setTimeout(() => this.completePublishJob(botId, profileName), mockPublishCompletionTime);

    return job;
  }

  public getJobStatus(botId: string, profileName: string): PublishJob {
    if (this.history && this.history[botId] && this.history[botId][profileName]) {
      const jobsForProfile = this.history[botId][profileName];
      return jobsForProfile[jobsForProfile.length - 1];
    } else {
      return undefined;
    }
  }

  public getProfileHistory(botId: string, profileName: string): PublishJob[] {
    if (this.history && this.history[botId] && this.history[botId][profileName]) {
      const jobsForProfile = this.history[botId][profileName];
      return jobsForProfile;
    } else {
      return undefined;
    }
  }

  private completePublishJob(botId: string, profileName: string) {
    const jobsForProfile = this.history[botId][profileName];
    const updatedJob: PublishJob = {
      ...jobsForProfile[jobsForProfile.length - 1],
      complete: true,
      success: true,
      link: {
        href: `bfemulator://livechat.open?botUrl=${encodeURIComponent('http://localhost:3978/api/messages')}`,
        text: 'Test in Emulator',
      },
      message: 'Publish successful.',
      lastUpdated: new Date(),
      status: 200,
    };
    const intermediateLogMessages = [
      'Unzipping bot contents...',
      'Unzipping bot contents complete.',
      'Parsing bot contents...',
      'Successfully parsed bot contents.',
      'Validating bot contents...',
      'Validation complete. Bot contents are valid.',
      'Writing bot contents to Power Virtual Agents storage...',
      'Bot contents successfully written.',
      'Publish successful.',
    ];
    updatedJob.logMessages.push(...intermediateLogMessages);
    jobsForProfile[jobsForProfile.length - 1] = updatedJob;
  }
}

const manager = new PublishJobManager();

// some number between 1000 & 11000
let globalJobId = +(Math.random() * 10000 + 1000).toFixed(0);

const publish = async (config: PublishConfig, project: IBotProject, metadata, user) => {
  const {
    // these are provided by Composer
    profileName, // the name of the publishing profile "My PVA Prod Slot"

    // these are specific to the PVA publish profile shape
    bot,
    env,
  } = config;

  // get the bot id from the project
  const botId = project.id;

  const job = manager.startPublishJob(botId, profileName, bot, env, metadata.comment);
  const response = {
    status: job.status,
    result: {
      id: job.id,
      time: job.lastUpdated,
      message: 'Publish accepted.',
      log: job.logMessages.join('\n'),
      comment: job.comment,
    },
  };
  return response;
};

const getStatus = async (config: PublishConfig, project: IBotProject, user) => {
  const profileName = config.profileName;
  const botId = project.id;

  const job = manager.getJobStatus(botId, profileName);

  if (!job) {
    return {
      status: 404,
      result: {
        message: 'Cannot find job for bot and target combination.',
      },
    };
  } else {
    return {
      status: job.status,
      result: {
        id: job.id,
        link: job.link,
        log: job.logMessages.join('\n'),
        time: job.lastUpdated,
        message: job.message,
        comment: job.comment,
      },
    };
  }
};

const history = async (config: PublishConfig, project: IBotProject, user) => {
  const {
    // these are provided by Composer
    profileName, // the name of the publishing profile "My PVA Prod Slot"

    // these are specific to the PVA publish profile shape
    bot,
    env,
  } = config;

  // get the bot id from the project
  const botId = project.id;
  return manager.getProfileHistory(botId, profileName);
  // const today = new Date();
  // const history = [
  //   {
  //     time: new Date().setDate(today.getDate() - 4) + 1000 * 60 * 111, // 4 days ago
  //     status: 200,
  //     message: 'Publish successful.',
  //     comment: 'Updated schedule meeting dialog',
  //     link: {
  //       href: `bfemulator://livechat.open?botUrl=${encodeURIComponent('http://localhost:3978/api/messages')}`,
  //       text: 'Test in Emulator',
  //     },
  //     log: '',
  //   },
  //   {
  //     time: new Date().setDate(today.getDate() - 1) + 1000 * 60 * 43,
  //     status: 200,
  //     message: 'Publish successful.',
  //     comment: 'Applied feedback to greeting message',
  //     link: {
  //       href: `bfemulator://livechat.open?botUrl=${encodeURIComponent('http://localhost:3978/api/messages')}`,
  //       text: 'Test in Emulator',
  //     },
  //     log: '',
  //   },
  //   {
  //     time: new Date().setDate(today.getDate() - 2) - 1000 * 60 * 54,
  //     status: 500,
  //     message: 'Server timed out while trying to publish. Please try again.',
  //     comment: 'Design update',
  //     log: '',
  //   },
  //   {
  //     time: new Date().setDate(today.getDate() - 2) - 1000 * 60 * 52,
  //     status: 200,
  //     message: 'Publish successful.',
  //     comment: 'Design update attempt 2',
  //     link: {
  //       href: `bfemulator://livechat.open?botUrl=${encodeURIComponent('http://localhost:3978/api/messages')}`,
  //       text: 'Test in Emulator',
  //     },
  //     log: '',
  //   },
  // ];
  // return history;
};

module.exports = {
  initialize,
};
