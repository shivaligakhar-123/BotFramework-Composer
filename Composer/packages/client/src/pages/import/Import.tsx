/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useState } from 'react';
import { FC } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface ImportPayload {
  description: string;
  name: string;
}

interface ImportPageProps {
  source: string;
  payload: string;
}

enum ImportStatus {
  LOADING,
  DONE,
}

export const ImportPage: FC<RouteComponentProps<ImportPageProps>> = (props) => {
  const [importStatus, setImportStatus] = useState<ImportStatus>(ImportStatus.LOADING);
  const { source, payload } = props;

  useEffect(() => {
    if (payload && source) {
      const doStuff = async () => {
        // go and start the import process on the server
        console.log('Starting the import process....', source, payload);
        const res = await fetch(`/api/import/${source}?payload=${encodeURIComponent(payload)}`, {
          method: 'POST',
        });
        const data = await res.json();
        console.log('Got result back from server: ', data);
        setImportStatus(ImportStatus.DONE);
        // navigate to creation flow with template selected
        const { templateDir } = data;
        const { description, name } = JSON.parse(payload) as ImportPayload;
        navigate(
          `/projects/create/${encodeURIComponent(source)}?imported=true&templateDir=${encodeURIComponent(
            templateDir
          )}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`
        );
      };
      doStuff();
    }
  }, [payload, source]);

  if (importStatus === ImportStatus.LOADING) {
    return (
      <div>
        <LoadingSpinner message={`Importing from ${source}...`} />
      </div>
    );
  }

  return <div>Done importing</div>;
};
