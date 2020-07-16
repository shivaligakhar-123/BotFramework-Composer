// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LgFile } from '@bfc/shared';

export type LuPayload = {
  content: string;
  id?: string;
};

export type LgParsePayload = {
  targetId: string;
  content: string;
  lgFiles: LgFile[];
};

export enum LuActionType {
  Parse = 'parse',
}

export enum LgActionType {
  Parse = 'parse',
}
