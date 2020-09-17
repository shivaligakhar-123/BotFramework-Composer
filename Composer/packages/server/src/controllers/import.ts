import { Request, Response } from 'express';
import { join, normalize } from 'path';
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
    payload: string;
  };
}

async function startImport(req: StartImportRequest, res: Response, next) {
  const { source } = req.params;
  const payload = req.query.payload;
  const parsedPayload: ImportPayload = JSON.parse(payload);
  console.log('starting import for: ', payload, source);

  // go get the .zip from the url
  const { url = '' } = parsedPayload;
  console.log(url);
  const result = await fetch('https://github.com/tonyanziano/FigUI/archive/master.zip');
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

  const newTemplateDir = normalize('C:\\Users\\tonya\\Desktop\\mock-pva-assets');

  setTimeout(() => {
    res.json({ templateDir: newTemplateDir, templateName: parsedPayload.templateName });
  }, 2000);
}

export const ImportController = {
  startImport,
};
