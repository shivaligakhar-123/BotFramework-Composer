// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Worker from './workers/luParser.worker.ts';
import { BaseWorker } from './baseWorker';
import { LuPayload, LuActionType } from './types';

// Wrapper class
class LuWorker extends BaseWorker<LuActionType> {
  parse(id: string, content: string) {
    const payload = { id, content };
    return this.sendMsg<LuPayload>(LuActionType.Parse, payload);
  }
}

export default new LuWorker(new Worker());
