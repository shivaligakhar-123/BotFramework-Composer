import { Request, Response } from 'express';
import { join } from 'path';
import { ensureDirSync } from 'fs-extra';
import extractZip from 'extract-zip';
import { contentProviderFactory } from '../externalContentProvider/contentProviderFactory';
import { ContentProviderMetadata } from '../externalContentProvider/externalContentProvider';
import { ExternalContentProviderType } from '../externalContentProvider/providerType';
import logger from '../logger';

const log = logger.extend('import-controller');

interface StartImportRequest extends Request {
  params: {
    source: ExternalContentProviderType;
  };
  query: {
    payload: string;
  };
}

async function startImport(req: StartImportRequest, res: Response, next) {
  const { source } = req.params;
  const { payload } = req.query;
  const metadata: ContentProviderMetadata = JSON.parse(payload);

  const contentProvider = contentProviderFactory.getProvider(source, metadata);
  if (contentProvider) {
    // download the bot content zip
    const pathToBotContentsZip = await contentProvider.downloadBotContent();

    // extract zip into new "template" directory
    const baseDir = join(__dirname, '/temp');
    ensureDirSync(baseDir);
    const templateDir = join(baseDir, 'extractedTemplate');

    try {
      log('Extracting bot zip...');
      await extractZip(pathToBotContentsZip, { dir: templateDir });
      log('Done extracting.');
      await contentProvider.cleanUp();
    } catch (e) {
      log('Error extracting zip: ', e);
    }

    setTimeout(() => {
      res.json({ templateDir });
    }, 2000);
  } else {
    res.status(500).send('No content provider found for source: ' + source);
  }
}

export const ImportController = {
  startImport,
};
