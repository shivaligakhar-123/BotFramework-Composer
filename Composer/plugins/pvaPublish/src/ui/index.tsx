import * as React from 'react';
import { render } from '@bfc/client-plugin-lib';
import { initializeIcons } from '@uifabric/icons';

import { PVADialog } from './authDialog';

initializeIcons();

render(<PVADialog />);
