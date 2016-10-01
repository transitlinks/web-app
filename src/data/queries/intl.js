/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { join } from 'path';
import files from '../source/files';
import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import IntlMessageType from '../types/IntlMessageType';
import { locales } from '../../config';

// A folder with messages
const CONTENT_DIR = './messages';

const intl = {
  
  type: new List(IntlMessageType),
  args: {
    locale: { type: new NonNull(StringType) },
  },
  async resolve({ request }, { locale }) {
    
    if (!locales.includes(locale)) {
      throw new Error(`Locale '${locale}' not supported`);
    }

    try {
      const localeData = await files.readFile(join(CONTENT_DIR, `${locale}.json`));
      return JSON.parse(localeData);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`Locale '${locale}' not found`);
      }
    }
  
  }

};

export default intl;
