/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useState } from 'react';
import { FC } from 'react';
import { RouteComponentProps } from '@reach/router';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface ImportPageProps {
  source: string;
  payload: any;
}

enum ImportStatus {
  LOADING,
  DONE,
}

export const ImportPage: FC<RouteComponentProps<ImportPageProps>> = (props) => {
  const [importStatus, setImportStatus] = useState<ImportStatus>(ImportStatus.LOADING);
  const { source, payload } = props;

  useEffect(() => {
    const doStuff = async () => {
      // go and start the import process on the server
      console.log('Starting the import process....', source, payload);
      const res = await fetch(`/api/import/${source}/${payload}`, { method: 'POST' });
      const data = await res.json();
      console.log('Got result back from server: ', data);
      setImportStatus(ImportStatus.DONE);
    };
    doStuff();
  }, []);

  if (importStatus === ImportStatus.LOADING) {
    return (
      <div>
        <LoadingSpinner message={`Importing from ${source}...`} />
      </div>
    );
  }

  return <div>Done importing</div>;
};
