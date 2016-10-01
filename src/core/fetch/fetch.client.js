/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import 'whatwg-fetch';

export const Headers = self.Headers;
export const Request = self.Request;
export const Response = self.Response;

export default async (url, options = {}) => {
  const response = await self.fetch.bind(self)(url, options);
  const contentType = response.headers.get('content-type');
  let body = {};
  if (contentType.indexOf('json') != -1) {
    body = response.json();
  }
  return Object.assign(body, { statusCode: response.status });
}

