import { Request, Response } from 'express';
import { join } from 'path';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';
import { mkdirSync, existsSync } from 'fs-extra';
import extractZip from 'extract-zip';

interface ImportPayload {
  url: string;
  templateName: string;
}

interface StartImportRequest extends Request {
  params: {
    source: string;
  };
  query: {
    accessToken: string;
    payload: string;
  };
}

async function startImport(req: StartImportRequest, res: Response, next) {
  const { source } = req.params;
  const { accessToken, payload } = req.query;
  const parsedPayload: ImportPayload = JSON.parse(payload);
  console.log('starting import for: ', payload, source);

  // go get the .zip from the url
  const { url = '' } = parsedPayload;
  console.log(url);
  const tenantId = '72f988bf-86f1-41af-91ab-2d7cd011db47';
  const result = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-CCI-TenantId': tenantId,
      'X-CCI-Routing-TenantId': tenantId,
    },
  });
  const contentType = result.headers.get('content-type');
  if (!contentType || contentType !== 'application/zip') {
    console.error('Invalid content type header! Must be application/zip');
  }

  // write .zip from response to disk
  const baseDir = join(__dirname, '/temp');
  const zipPath = join(baseDir, 'bot-assets.zip');
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir);
  }
  if (result && result.body) {
    const zipDest = createWriteStream(zipPath);
    result.body.pipe(zipDest);
  }

  console.log('Saved zip...');

  // extract zip into "template" directory
  const templateDir = join(baseDir, 'extractedTemplate');
  if (!existsSync(templateDir)) {
    mkdirSync(templateDir);
  }

  console.log('Extracting zip...');

  try {
    await extractZip(zipPath, { dir: templateDir });
    console.log('Done extracting.');
  } catch (e) {
    console.error('Error extracting zip: ', e);
  }

  setTimeout(() => {
    res.json({ templateDir, templateName: parsedPayload.templateName });
  }, 2000);
}

export const ImportController = {
  startImport,
};
