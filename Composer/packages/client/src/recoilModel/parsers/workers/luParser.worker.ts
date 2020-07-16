// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { luIndexer } from '@bfc/indexers';

import { LuActionType } from '../types';
const ctx: Worker = self as any;

const parse = (id: string, content: string) => {
  return luIndexer.parse(content, id);
};

export const handleMessage = (msg) => {
  const { type, payload } = msg.data;
  const { content, id } = payload;
  let result: any = null;
  switch (type) {
    case LuActionType.Parse: {
      result = parse(id, content);
      break;
    }
  }
  return result;
};

ctx.onmessage = function (msg) {
  const { id } = msg.data;
  try {
    const payload = handleMessage(msg);

    ctx.postMessage({ id, payload });
  } catch (error) {
    ctx.postMessage({ id, error });
  }
};
