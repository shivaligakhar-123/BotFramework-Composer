// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, RenderHookResult, HookResult } from '@bfc/test-utils/lib/hooks';
import { useRecoilState } from 'recoil';

import { projectDispatcher } from '../project';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  skillManifestsState,
  luFilesState,
  lgFilesState,
  settingsState,
  dialogsState,
  botEnvironmentState,
  botNameState,
  botStatusState,
  locationState,
  skillsState,
  schemasState,
  localeState,
  BotDiagnosticsState,
  botOpeningState,
  projectIdState,
  recentProjectsState,
  applicationErrorState,
} from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';

import mockProjectResponse from './__mocks__/mockProjectResponse.json';

let httpMocks;
let navigateTo;

jest.mock('../../../utils/navigation', () => {
  const navigateMock = jest.fn();
  navigateTo = navigateMock;
  return {
    navigateTo: navigateMock,
  };
});

jest.mock('axios', () => {
  const mockedVal = {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  };
  httpMocks = mockedVal;
  return {
    create: jest.fn(() => {
      return {
        put: mockedVal.put,
        post: mockedVal.post,
        delete: mockedVal.delete,
        get: mockedVal.get,
      };
    }),
  };
});

jest.mock('../../parsers/lgWorker', () => {
  return {
    flush: () => new Promise((resolve) => resolve()),
  };
});

jest.mock('../../parsers/luWorker', () => {
  return {
    flush: () => new Promise((resolve) => resolve()),
  };
});

jest.mock('../../persistence/FilePersistence', () => {
  return {
    flush: () => new Promise((resolve) => resolve()),
  };
});

describe('Project dispatcher', () => {
  const useRecoilTestHook = () => {
    const botOpening = useRecoilValue(botOpeningState);
    const skillManifests = useRecoilValue(skillManifestsState);
    const luFiles = useRecoilValue(luFilesState);
    const lgFiles = useRecoilValue(lgFilesState);
    const settings = useRecoilValue(settingsState);
    const dialogs = useRecoilValue(dialogsState);
    const botEnvironment = useRecoilValue(botEnvironmentState);
    const botName = useRecoilValue(botNameState);
    const botStatus = useRecoilValue(botStatusState);
    const skills = useRecoilValue(skillsState);
    const location = useRecoilValue(locationState);
    const schemas = useRecoilValue(schemasState);
    const diagnostics = useRecoilValue(BotDiagnosticsState);
    const projectId = useRecoilValue(projectIdState);
    const locale = useRecoilValue(localeState);
    const currentDispatcher = useRecoilValue(dispatcherState);
    const [recentProjects, setRecentProjects] = useRecoilState(recentProjectsState);
    const appError = useRecoilValue(applicationErrorState);

    return {
      botOpening,
      skillManifests,
      luFiles,
      lgFiles,
      settings,
      dialogs,
      botEnvironment,
      botName,
      botStatus,
      skills,
      location,
      schemas,
      diagnostics,
      projectId,
      locale,
      currentDispatcher,
      recentProjects,
      appError,
      setRecentProjects,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    navigateTo.mockReset();
    const rendered: RenderHookResult<unknown, ReturnType<typeof useRecoilTestHook>> = renderRecoilHook(
      useRecoilTestHook,
      {
        states: [],
        dispatcher: {
          recoilState: dispatcherState,
          initialValue: {
            projectDispatcher,
          },
        },
      }
    );
    renderedComponent = rendered.result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should open bot project', async () => {
    let result;
    httpMocks.put.mockResolvedValueOnce({
      data: mockProjectResponse,
    });
    await act(async () => {
      result = await dispatcher.openBotProject('../test/empty-bot', 'default');
    });
    expect(renderedComponent.current.projectId).toBe(mockProjectResponse.id);
    expect(renderedComponent.current.botName).toBe(mockProjectResponse.botName);
    expect(renderedComponent.current.locale).toBe(mockProjectResponse.locale);
    expect(renderedComponent.current.settings).toBe(mockProjectResponse.settings);
    expect(renderedComponent.current.lgFiles.length).toBe(7);
    expect(renderedComponent.current.luFiles.length).toBe(6);
    expect(renderedComponent.current.botEnvironment).toBe(mockProjectResponse.botEnvironment);
    expect(renderedComponent.current.skills.length).toBe(0);
    expect(renderedComponent.current.botOpening).toBeFalsy();
    expect(renderedComponent.current.schemas.sdk).toBeDefined();
    expect(renderedComponent.current.schemas.default).toBeDefined();
    expect(renderedComponent.current.schemas.diagnostics?.length).toBe(0);
    expect(navigateTo).toHaveBeenLastCalledWith('/bot/30876.502871204648/dialogs/emptybot-1');
    expect(result).toBe(renderedComponent.current.projectId);
  });

  it('should handle project failure if project does not exist', async () => {
    const errorObj = {
      data: 'Project does not exist in cache',
    };
    httpMocks.put.mockRejectedValueOnce(errorObj);
    renderedComponent.current.setRecentProjects([
      {
        path: '../test/empty-bot',
      },
    ]);
    await act(async () => {
      await dispatcher.openBotProject('../test/empty-bot', 'default');
      expect(renderedComponent.current.botOpening).toBeFalsy();
    });
    expect(renderedComponent.current.appError).toEqual(errorObj);
    expect(renderedComponent.current.recentProjects.length).toBe(0);
    expect(navigateTo).not.toHaveBeenCalled();
  });
});