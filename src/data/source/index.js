import localityRepositoryReal from './localityRepository';
import linkRepositoryReal from './linkRepository';
import postRepositoryReal from './postRepository';
import * as ratingRepositoryReal from './ratingRepository';
import * as userRepositoryReal from './userRepository';
import commentRepositoryReal from './commentRepository';
import filesReal from './files';

import placesApiReal from './placesApi';
import placesApiMock from './mocks/placesApi';

let localityRepository;
let linkRepository;
let postRepository;
let userRepository;
let ratingRepository;
let commentRepository;
let files;
let placesApi;

if (process.env.TEST_ENV === 'test') {
  localityRepository = localityRepositoryReal;
  linkRepository = linkRepositoryReal;
  postRepository = postRepositoryReal;
  userRepository = userRepositoryReal;
  ratingRepository = ratingRepositoryReal;
  commentRepository = commentRepositoryReal;
  files = filesReal;
  placesApi = placesApiReal;
} else {
  localityRepository = localityRepositoryReal;
  linkRepository = linkRepositoryReal;
  postRepository = postRepositoryReal;
  userRepository = userRepositoryReal;
  ratingRepository = ratingRepositoryReal;
  commentRepository = commentRepositoryReal;
  files = filesReal;
  placesApi = placesApiReal;
}

export { 
  localityRepository, linkRepository, userRepository, ratingRepository,
  postRepository, commentRepository,
  files, placesApi 
};
