import { useCallback, useEffect, useMemo, useState, FC } from 'react';
import * as React from 'react';
import { getAccessToken, setConfigIsValid, setPublishConfig, fetch } from '@bfc/client-plugin-lib';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import { root, dropdown, label } from './styles';
import { Bot, BotEnvironment } from './types';

const API_VERSION = '1';
const BASE_URL = `https://bots.sdf.customercareintelligence.net/api/botmanagement/v${API_VERSION}`;

const fetchEnvsWaitTime = 3000;
const fetchBotsWaitTime = 1000;

const mockEnvironments: Partial<BotEnvironment>[] = [
  { id: '1', displayName: 'MS Personal Productivity (msdefault) (mesdefault)' },
  { id: '2', displayName: '__ Power Virtual Agents (MSFT employees)' },
  { id: '3', displayName: 'Bot Framework Power Apps' },
];

// fake map of environment id to lists of bots
const mockBotsMap = {
  '1': [
    { id: '1', name: 'Bot 1' },
    { id: '2', name: 'Bot 2' },
    { id: '3', name: 'Bot 3' },
  ], // MS Personal Productivity
  '2': [
    { id: '4', name: 'Bot 4' },
    { id: '5', name: 'Bot 5' },
    { id: '6', name: 'Bot 6' },
  ], // __ Power Virtual Agents (MSFT employees)
  '3': [
    { id: '7', name: 'Bot 7' },
    { id: '8', name: 'Bot 8' },
    { id: '9', name: 'Bot 9' },
  ], // Bot Framework Power Apps
};

const pvaBranding = '#0F677B';
const pvaBrandingHover = '#0A4A5C';
const pvaBrandingClick = '#073845';

export const PVADialog: FC = () => {
  const [token, setToken] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [envs, setEnvs] = useState<BotEnvironment[]>([]);
  const [env, setEnv] = useState<string>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [bot, setBot] = useState<Bot>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [fetchingEnvironments, setFetchingEnvironments] = useState(false);
  const [fetchingBots, setFetchingBots] = useState(false);

  const login = useCallback(() => {
    setLoggingIn(true);
    const loginAndGetToken = async () => {
      const token = await getAccessToken({
        clientId: 'ce48853e-0605-4f77-8746-d70ac63cc6bc',
        scopes: ['96ff4394-9197-43aa-b393-6a41652e21f8/.default'],
      }); // this function would manage expiry and storage on the composer side
      setLoggingIn(false);
      setToken(token);
    };
    loginAndGetToken();
  }, []);

  const pvaHeaders = useMemo(() => {
    if (token && tenantId) {
      return {
        Authorization: `Bearer ${token}`,
        'X-CCI-TenantId': tenantId,
        'X-CCI-Routing-TenantId': tenantId,
      };
    }
  }, [tenantId, token]);

  useEffect(() => {
    if (token) {
      // parse the jwt token to extract the tenant id
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const tenantId = decodedPayload.tid;
      setTenantId(tenantId);
    }
  }, [token]);

  useEffect(() => {
    if (tenantId) {
      // get environments for tenant id
      // const url = `${BASE_URL}/environments`;
      const fetchEnvs = async () => {
        // const headers = pvaHeaders;
        setFetchingEnvironments(true);
        // const res = await fetch(url, { method: 'GET', headers });
        // const envs = await res.json();
        await new Promise((resolve) => {
          // fake waiting for API call
          setTimeout(resolve, fetchEnvsWaitTime);
        });
        setFetchingEnvironments(false);
        setEnvs(mockEnvironments as BotEnvironment[]);
        // setEnvs(envs);
        // if (envs && envs.length) {
        //   setEnv(envs[0]);
        // }
      };
      fetchEnvs();
    }
  }, [tenantId, token, pvaHeaders]);

  const onSelectEnv = useCallback((event, item: IDropdownOption) => {
    setEnv(item.key + '');
  }, []);

  const onSelectBot = useCallback(
    (event, item: IDropdownOption) => {
      const botId = item.key + '';
      const bot = mockBotsMap[env].find((bot) => bot.id === botId);
      // const bot = bots.find((bot) => bot.id === event.target.value);
      setBot(bot);
    },
    [bots, env]
  );

  useEffect(() => {
    if (env) {
      // get bots for environment
      // const url = `${BASE_URL}/environments/${encodeURIComponent(env)}/bots`;
      const fetchBots = async () => {
        // const headers = pvaHeaders;
        setFetchingBots(true);
        // const res = await fetch(url, { method: 'GET', headers });
        // const bots = await res.json();
        await new Promise((resolve) => {
          // fake waiting for API call
          setTimeout(resolve, fetchBotsWaitTime);
        });
        setFetchingBots(false);
        setBots(mockBotsMap[env]);
        // if (bots && bots.length) {
        //   setBot(bots[0]);
        // } else {
        //   setBot(null);
        // }
      };
      fetchBots();
    }
  }, [env, pvaHeaders]);

  useEffect(() => {
    if (!!env && !!bot) {
      setConfigIsValid(true);
    } else {
      setConfigIsValid(false);
    }
    setPublishConfig({ bot, env });
  }, [env, bot]);

  const loggedIn = useMemo(() => {
    return !!token && !!tenantId;
  }, [tenantId, token]);

  const loginButton = useMemo(() => {
    if (!loggedIn) {
      return (
        <PrimaryButton
          text={'Login to PVA'}
          onClick={login}
          styles={{
            root: { backgroundColor: pvaBranding, marginTop: 20, border: 0, maxWidth: 150 },
            rootHovered: { backgroundColor: pvaBrandingHover, border: 0 },
            rootPressed: { backgroundColor: pvaBrandingClick, border: 0 },
          }}
        />
      );
    }
  }, [loggedIn]);

  const loginStatusMessage = useMemo(() => {
    if (loggingIn) {
      return (
        <Spinner
          size={SpinnerSize.medium}
          labelPosition={'right'}
          label={'Logging in...'}
          style={{ marginTop: 16, marginRight: 'auto' }}
        />
      );
    }
    if (!loggedIn) {
      return null;
      // return <p>Please login</p>;
    }
  }, [loggedIn, loggingIn]);

  const envPicker = useMemo(() => {
    if (loggedIn) {
      if (!fetchingEnvironments) {
        if (envs.length) {
          const envOptions = envs.map((env) => {
            return { key: env.id, text: env.displayName };
          });
          return (
            <>
              <Dropdown
                label={'Environment'}
                onChange={onSelectEnv}
                placeholder={'Select an environment'}
                options={envOptions}
                responsiveMode={ResponsiveMode.large}
              />
            </>
          );
        } else {
          return <p>No environments found.</p>;
        }
      } else {
        return (
          <Spinner
            size={SpinnerSize.medium}
            labelPosition={'right'}
            label={'Fetching environments...'}
            style={{ marginTop: 16, marginRight: 'auto' }}
          />
        );
      }
    }
  }, [loggedIn, fetchingEnvironments, envs]);

  const botPicker = useMemo(() => {
    if (loggedIn && !fetchingEnvironments && env) {
      if (!fetchingBots) {
        if (bots.length) {
          const botOptions = bots.map((bot) => {
            return { key: bot.id, text: bot.name };
          });
          return (
            <>
              <Dropdown
                label={'Bot'}
                onChange={onSelectBot}
                placeholder={'Select a bot'}
                options={botOptions}
                responsiveMode={ResponsiveMode.large}
                defaultSelectedKey={botOptions[0].key}
              />
            </>
          );
        } else {
          return <p>No bots found.</p>;
        }
      } else {
        return (
          <Spinner
            size={SpinnerSize.medium}
            labelPosition={'right'}
            label={'Fetching bots...'}
            style={{ marginTop: 16, marginRight: 'auto' }}
          />
        );
      }
    }
  }, [loggedIn, fetchingEnvironments, env, fetchingBots, bots]);

  const branding = (
    <span style={{ marginTop: 'auto', display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' }}>
      <i
        style={{
          display: 'inline-block',
          bottom: 0,
          left: 0,
          width: 30,
          height: 30,
          backgroundImage:
            'url("https://cci-prod-botdesigner.azureedge.net/20200818.7/ppux/0.0.20200818.1-ppux-ppe-2020-08-12-prod/static/media/NewBotIcon.e05db014.svg")',
        }}
      ></i>
      <p style={{ paddingLeft: 8, fontSize: 15 }}>Power Virtual Agents</p>
    </span>
  );

  return (
    <div style={root}>
      {loginButton}
      {loginStatusMessage}
      {envPicker}
      {botPicker}
      {branding}
    </div>
  );
};
