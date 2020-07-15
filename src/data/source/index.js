import localityRepositoryReal from './localityRepository';
import linkRepositoryReal from './linkRepository';
import postRepositoryReal from './postRepository';
import terminalRepositoryReal from './terminalRepository';
import * as ratingRepositoryReal from './ratingRepository';
import * as userRepositoryReal from './userRepository';
import commentRepositoryReal from './commentRepository';
import checkInRepositoryReal from './checkInRepository';
import tagRepositoryReal from './tagRepository';
import filesReal from './files';

import placesApiReal from './placesApi';
import placesApiMock from './mocks/placesApi';

let localityRepository;
let linkRepository;
let postRepository;
let terminalRepository;
let userRepository;
let ratingRepository;
let commentRepository;
let checkInRepository;
let tagRepository;
let files;
let placesApi;

if (process.env.TEST_ENV === 'test') {
  localityRepository = localityRepositoryReal;
  linkRepository = linkRepositoryReal;
  postRepository = postRepositoryReal;
  terminalRepository = terminalRepositoryReal;
  userRepository = userRepositoryReal;
  ratingRepository = ratingRepositoryReal;
  commentRepository = commentRepositoryReal;
  checkInRepository = checkInRepositoryReal;
  tagRepository = tagRepositoryReal;
  files = filesReal;
  placesApi = placesApiReal;
} else {
  localityRepository = localityRepositoryReal;
  linkRepository = linkRepositoryReal;
  postRepository = postRepositoryReal;
  terminalRepository = terminalRepositoryReal;
  userRepository = userRepositoryReal;
  ratingRepository = ratingRepositoryReal;
  commentRepository = commentRepositoryReal;
  checkInRepository = checkInRepositoryReal;
  tagRepository = tagRepositoryReal;
  files = filesReal;
  placesApi = placesApiReal;
}

export {
  localityRepository, linkRepository, userRepository, ratingRepository,
  postRepository, terminalRepository, commentRepository, checkInRepository,
  tagRepository,
  files, placesApi
};
