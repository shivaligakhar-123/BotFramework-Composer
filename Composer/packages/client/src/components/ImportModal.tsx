/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { LoadingSpinner } from './LoadingSpinner';

export const ImportModal: React.FC<RouteComponentProps> = (props) => {
  const { location } = props;
  useEffect(() => {
    const doImport = async () => {
      if (location && location.href) {
        const url = new URL(location.href);
        const source = url.searchParams.get('source');
        const payload = url.searchParams.get('payload');
        if (!source || !payload) {
          // TODO: error out here
          console.error('Missing source or payload.');
          return;
        }

        const res = await fetch(`/api/import/${source}?payload=${encodeURIComponent(payload)}`, {
          method: 'POST',
        });
        const data = await res.json();

        // navigate to creation flow with template selected
        const { templateDir } = data;
        const { description, name } = JSON.parse(payload) as { description: string; name: string };
        navigate(
          `/projects/create/${encodeURIComponent(source)}?imported=true&templateDir=${encodeURIComponent(
            templateDir
          )}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`
        );
      }
    };
    doImport();
  }, [location]);

  return (
    <Dialog hidden={false} dialogContentProps={{ type: DialogType.normal }}>
      <LoadingSpinner message={'Importing bot content...'} />
    </Dialog>
  );
};
