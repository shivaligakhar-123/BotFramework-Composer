export type PVAPublishJob = {
  comment: string;
  diagnostics: string[];
  lastUpdateTimeUtc: string;
  operationId: string;
  startTimeUtc: string;
  state: PublishState;
};

export interface PublishConfig {
  fullSettings: any;
  profileName: string;
  [key: string]: any;
}

export type PublishState =
  | 'Validating'
  | 'LoadingContent'
  | 'UpdatingSnapshot'
  | 'Done'
  | 'PreconditionFailed'
  | 'Failed';

/** Copied from @bfc/extension */
export interface PublishResult {
  comment?: string;
  endpointURL?: string;
  id?: string;
  log?: string;
  message: string;
  status?: number;
  time?: Date;
}

/** Copied from @bfc/extension */
export interface PublishResponse {
  status: number;
  result: PublishResult;
}

/** Copied from @bfc/extension */
export interface UserIdentity {
  [key: string]: any;
}
