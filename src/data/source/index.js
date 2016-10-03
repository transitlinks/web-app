import localityRepositoryReal from './localityRepository';
import linkRepositoryReal from './linkRepository';
import filesReal from './files';

import placesApiReal from './placesApi';
import placesApiMock from './mocks/placesApi';

let localityRepository;
let linkRepository;
let files;
let placesApi;

if (process.env.TEST_ENV === 'test') {
  localityRepository = localityRepositoryReal;
  linkRepository = linkRepositoryReal;
  files = filesReal;
  placesApi = placesApiMock;
} else {
  localityRepository = localityRepositoryReal;
  linkRepository = linkRepositoryReal;
  files = filesReal;
  placesApi = placesApiReal;
}

export { localityRepository, linkRepository, files, placesApi };