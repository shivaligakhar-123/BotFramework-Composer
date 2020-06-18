import { useCallback, useEffect, useMemo, useState, FC } from 'react';
import * as React from 'react';
import { getAccessToken, setConfigIsValid, setPublishConfig, fetch } from '@bfc/client-plugin-lib';

import { root, button, dropdown, label } from './styles';
import { Bot, BotEnvironment } from './types';

const API_VERSION = '1';
const BASE_URL = `https://bots.sdf.customercareintelligence.net/api/botmanagement/v${API_VERSION}`;

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
      const url = `${BASE_URL}/environments`;
      const fetchEnvs = async () => {
        const headers = pvaHeaders;
        setFetchingEnvironments(true);
        const res = await fetch(url, { method: 'GET', headers });
        const envs = await res.json();
        setFetchingEnvironments(false);
        setEnvs(envs);
        if (envs && envs.length) {
          setEnv(envs[0]);
        }
      };
      fetchEnvs();
    }
  }, [tenantId, token, pvaHeaders]);

  const onSelectEnv = useCallback((event) => {
    setEnv(event.target.value);
  }, []);

  const onSelectBot = useCallback(
    (event) => {
      const bot = bots.find((bot) => bot.id === event.target.value);
      setBot(bot);
    },
    [bots]
  );

  useEffect(() => {
    if (env) {
      // get bots for environment
      const url = `${BASE_URL}/environments/${encodeURIComponent(env)}/bots`;
      const fetchBots = async () => {
        const headers = pvaHeaders;
        setFetchingBots(true);
        const res = await fetch(url, { method: 'GET', headers });
        const bots = await res.json();
        setFetchingBots(false);
        setBots(bots);
        if (bots && bots.length) {
          setBot(bots[0]);
        } else {
          setBot(null);
        }
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
        <button style={button} onClick={login}>
          Login
        </button>
      );
    }
  }, [loggedIn]);

  const loginStatusMessage = useMemo(() => {
    if (loggingIn) {
      return <p>Logging in...</p>;
    }
    if (!loggedIn) {
      return <p>Please login</p>;
    }
  }, [loggedIn, loggingIn]);

  const envPicker = useMemo(() => {
    if (loggedIn) {
      if (!fetchingEnvironments) {
        if (envs.length) {
          return (
            <>
              <label style={label}>Environment:</label>
              <select style={dropdown} onChange={onSelectEnv}>
                {envs.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.displayName}
                  </option>
                ))}
              </select>
            </>
          );
        } else {
          return <p>No environments found.</p>;
        }
      } else {
        return <p>Fetching environments...</p>;
      }
    }
  }, [loggedIn, fetchingEnvironments, envs]);

  const botPicker = useMemo(() => {
    if (loggedIn && !fetchingEnvironments && env) {
      if (!fetchingBots) {
        if (bots.length) {
          return (
            <>
              <label style={label}>Bot:</label>
              <select style={dropdown} onChange={onSelectBot}>
                {bots.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name}
                  </option>
                ))}
              </select>
            </>
          );
        } else {
          return <p>No bots found.</p>;
        }
      } else {
        return <p>Fetching bots...</p>;
      }
    }
  }, [loggedIn, fetchingEnvironments, env, fetchingBots, bots]);

  return (
    <div style={root}>
      {loginButton}
      {loginStatusMessage}
      {envPicker}
      {botPicker}
    </div>
  );
};
