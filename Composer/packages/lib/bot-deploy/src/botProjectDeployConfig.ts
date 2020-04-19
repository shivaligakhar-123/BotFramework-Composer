// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface BotProjectDeployConfig {
  // Subscription Id of Auzre Account
  subId: string;

  // The token for user login
  accessToken: string;

  // The token for aad-graph
  graphToken: string;

  // The project path to deploy
  projPath: string;

  // Logger
  logger: (string) => any;

  // Deployment settings file path
  deploymentSettingsPath?: string;

  // Deploy file path, default is .deployment file
  deployFilePath?: string;

  // Zip file path, default is 'code.zip'
  zipPath?: string;

  // Pulblishing folder for 'dotnet publish' command, default is 'bin/Release/netcoreapp3.1'
  publishFolder?: string;

  // The deployment settings file path, default is 'appsettings.deployment.json'
  settingsPath?: string;

  // The ARM template file path, default is 'DeploymentTemplates/template-with-preexisting-rg.json'
  templatePath?: string;

  // Dotnet project path, default is 'BotProject.csproj'
  dotnetProjectPath?: string;

  // Lubuild generated folder path, default is 'generated'
  generatedFolder?: string;

  // Remote bot json dialog path, default is 'ComposerDialogs'
  remoteBotPath?: string;

  [key: string]: any;
}