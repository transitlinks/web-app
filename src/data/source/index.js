import localityRepositoryReal from './localityRepository';
import linkRepositoryReal from './linkRepository';
import * as ratingRepositoryReal from './ratingRepository';
import * as userRepositoryReal from './userRepository';
import filesReal from './files';

import placesApiReal from './placesApi';
import placesApiMock from './mocks/placesApi';

let localityRepository;
let linkRepository;
let userRepository;
let ratingRepository;
let files;
let placesApi;

if (process.env.TEST_ENV === 'test') {
  localityRepository = localityRepositoryReal;
  linkRepository = linkRepositoryReal;
  userRepository = userRepositoryReal;
  ratingRepository = ratingRepositoryReal;
  files = filesReal;
  placesApi = placesApiMock;
} else {
  localityRepository = localityRepositoryReal;
  linkRepository = linkRepositoryReal;
  userRepository = userRepositoryReal;
  ratingRepository = ratingRepositoryReal;
  files = filesReal;
  placesApi = placesApiReal;
}

export { 
  localityRepository, linkRepository, userRepository, ratingRepository,
  files, placesApi 
};
