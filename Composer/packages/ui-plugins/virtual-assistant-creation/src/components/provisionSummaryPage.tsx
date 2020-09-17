// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { DialogFooterWrapper } from './dialogFooterWrapper';
import { RouterPaths } from '../shared/constants';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

interface ProvisionSummaryPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  onDismiss: () => void;
  onSubmit: () => void;
}

export const ProvisionSummaryPage: React.FC<ProvisionSummaryPageProps> = (props) => {
  const { onDismiss, onSubmit } = props;

  const columns: IColumn[] = [
    {
      key: 'column1',
      name: 'Resource',
      fieldName: 'Resource',
      minWidth: 50,
      maxWidth: 200,
      isResizable: false,
      isMultiline: false,
    },
    {
      key: 'column2',
      name: 'Notes',
      fieldName: 'Notes',
      minWidth: 300,
      maxWidth: 500,
      isResizable: false,
      isMultiline: true,
    },
  ];

  const items = [
    {
      key: '0',
      Resource: 'Azure Bot Service',
      Notes:
        'The Azure Bot Service resource stores configuration information that allows your Virtual Assistant to be accessed on the supported Channels and provide OAuth authentication.',
    },
    {
      key: '1',
      Resource: 'Azure Blob Storage',
      Notes: 'Used to store conversation transcripts.',
    },
    {
      key: '2',
      Resource: 'Azure Cosmos DB',
      Notes: 'Used to store conversation state.',
    },
    {
      key: '3',
      Resource: 'Azure App Service Plan',
      Notes: 'Used to host your Bot Web App and QnA Maker Web App.',
    },
    {
      key: '4',
      Resource: 'Azure Application Insights',
      Notes: 'Used to capture conversation and application telemetry.',
    },
    {
      key: '5',
      Resource: 'Bot Web App',
      Notes: 'Hosts your Bot application.',
    },
    {
      key: '6',
      Resource: 'Language Understanding',
      Notes: 'Subscription keys for Language Understanding Cognitive Service.',
    },
    {
      key: '7',
      Resource: 'QnA Maker',
      Notes: 'Subscription keys for QnA Maker Cognitive Service which facilitates the bot personality you selected.',
    },
    {
      key: '8',
      Resource: 'QnA Maker Web App',
      Notes: 'Hosts your QnA Maker knowledgebases',
    },
    {
      key: '9',
      Resource: 'QnA Maker Azure Search Service',
      Notes: 'Search index for your QnA Maker knowledgebases. ',
    },
  ];

  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        onDismiss={props.onDismiss}
        title={'Provisioning Summary'}
        subText={'The following will be provisioned to enable your bot'}
        dialogType={DialogTypes.CreateFlow}
      >
        <Pivot aria-label="Basic Pivot Example">
          <PivotItem headerText="Summary">
            <DetailsList
              items={items}
              columns={columns}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
            />
          </PivotItem>
          <PivotItem headerText="ARM Template">
            <TextField
              value={'Hold off on development until Composer provisioning spec is locked down'}
              multiline
              rows={40}
              disabled
            />
          </PivotItem>
        </Pivot>
        <DialogFooterWrapper prevPath={RouterPaths.configSummaryPage} onSubmit={onSubmit} onDismiss={onDismiss} />
      </DialogWrapper>
    </Fragment>
  );
};

export default ProvisionSummaryPage;
