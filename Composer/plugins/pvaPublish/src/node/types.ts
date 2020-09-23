export type PublishResponse = {
  comment: string;
  diagnostics: string[];
  lastUpdateTimeUtc: string;
  operationId: string;
  startTimeUtc: string;
  state: string;
};

type PublishState = 'Validating' | '';
