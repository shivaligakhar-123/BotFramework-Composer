import { IBotProject } from '@bfc/shared';

interface PublishConfig {
  fullSettings: any;
  profileName: string; //profile name
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

interface BotHistory {
  [botId: string]: JobRecord;
}

interface JobRecord {
  jobId: number;
  comment?: string;
  complete: boolean;
  lastUpdated: Date;
  message: string;
  status?: number;
  success: boolean;
}

const mockPublishCompletionTime = 1000 * 20; // 20 seconds

class JobManager {
  private history: BotHistory;

  constructor() {
    this.history = {};
  }

  public startPublishJob(botId: string, comment?: string): JobRecord {
    const job: JobRecord = {
      jobId: globalJobId++,
      comment,
      complete: false,
      lastUpdated: new Date(),
      message: 'Publish in progress...',
      success: false,
      status: 202,
    };
    this.history[botId] = job;

    // start fake wait for job completion
    console.log(`started publish job ${job.jobId}... will complete in ${mockPublishCompletionTime} milleseconds`);
    setTimeout(() => this.completePublishJob(botId), mockPublishCompletionTime);

    return job;
  }

  public getJobStatus(botId: string, profileName: string): JobRecord {
    return this.history[botId];
  }

  private completePublishJob(botId: string) {
    const updatedJob: JobRecord = {
      ...this.history[botId],
      complete: true,
      success: true,
      message: 'Publish successful.',
      lastUpdated: new Date(),
      status: 200,
    };
    this.history[botId] = updatedJob;
  }
}

const manager = new JobManager();

// some number between 1000 & 11000
let globalJobId = +(Math.random() * 10000 + 1000).toFixed(0);

const publish = async (config: PublishConfig, project: IBotProject, metadata, user) => {
  const {
    // these are provided by Composer
    profileName, // the name of the publishing profile "My Azure Prod Slot"

    // these are specific to the PVA publish profile shape
    bot,
    env,
  } = config;

  // get the bot id from the project
  const botId = project.id;

  const job = manager.startPublishJob(botId, metadata.comment);

  const logMessages = [`Publishing started for bot ${bot.name} in environment: ${env}`];
  const response = {
    status: job.status,
    result: {
      id: job.jobId,
      time: job.lastUpdated,
      message: 'Publish accepted.',
      log: logMessages.join('\n'),
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
        id: job.jobId,
        time: job.lastUpdated,
        message: job.message,
        comment: job.comment,
      },
    };
  }
};

const history = async (config: PublishConfig, project: IBotProject, user) => {
  const today = new Date();
  const history = [
    {
      time: new Date().setDate(today.getDate() - 4) + 1000 * 60 * 111, // 4 days ago
      status: 200,
      message: 'Publish successful.',
      comment: 'Updated schedule meeting dialog',
      log: '',
    },
    {
      time: new Date().setDate(today.getDate() - 1) + 1000 * 60 * 43,
      status: 200,
      message: 'Publish successful.',
      comment: 'Applied feedback to greeting message',
      log: '',
    },
    {
      time: new Date().setDate(today.getDate() - 2) - 1000 * 60 * 54,
      status: 500,
      message: 'Server timed out while trying to publish. Please try again.',
      comment: 'Design update',
      log: '',
    },
    {
      time: new Date().setDate(today.getDate() - 2) - 1000 * 60 * 52,
      status: 200,
      message: 'Publish successful.',
      comment: 'Design update attempt 2',
      log: '',
    },
  ];
  return history;
};

module.exports = {
  initialize,
};
