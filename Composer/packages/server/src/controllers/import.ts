import { Request, Response } from 'express';
import { join } from 'path';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';
import { mkdirSync, existsSync } from 'fs-extra';

interface ImportPayload {
  url: string;
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

  // go get the .zip from the url
  const { url = '' } = payload;
  const result = await fetch(url || 'https://github.com/tonyanziano/FigUI/archive/master.zip');
  const contentType = result.headers.get('content-type');
  if (!contentType || contentType !== 'application/zip') {
    console.error('Invalid content type header! Must be application/zip');
  }

  // write .zip from response to disk
  const baseDir = join(__dirname, '/temp');
  const path = join(baseDir, 'bot-assets.zip');
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir);
  }
  if (result && result.body) {
    const dest = createWriteStream(path);
    result.body.pipe(dest);
  }

  // unpack bot assets and save them
  //await saveBotAssetsToPath(zip, path);

  setTimeout(() => {
    res.json({ path });
  }, 2000);
}

export const ImportController = {
  startImport,
};
