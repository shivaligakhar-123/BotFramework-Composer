import { Request, Response } from 'express';

interface ImportPayload {
  [key: string]: any;
}

interface StartImportRequest extends Request {
  params: {
    payload: ImportPayload;
    source: string;
  };
}

async function startImport(req: StartImportRequest, res: Response, next) {
  const { payload, source } = req.params;
  console.log('starting import for: ', payload, source);

  // do some stuff to unpack all the assets and all that
  const result = { hello: 'world' };

  setTimeout(() => {
    res.json(result);
  }, 2000);
}

export const ImportController = {
  startImport,
};
