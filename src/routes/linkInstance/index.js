import { getLog } from '../../core/log';
const log = getLog('routes/linkInstance');

import React from 'react';
import LinkInstance from './LinkInstance';
import ErrorPage from '../../components/common/ErrorPage';
import fetch from '../../core/fetch';

export default {

  path: '/link-instance/:uuid?/:action?',

  async action({ params, context }) {
    
    const { graphqlRequest } = context.store.helpers;
    
    let userUuid = null; 
    const state = context.store.getState();
    const { auth } = state.auth;
    if (auth.loggedIn) {
      userUuid = auth.user.uuid;
    }
     
    try { 
    
      if (params.uuid) {
        
        const { data } = await graphqlRequest(
          `query {
            linkInstance(uuid: "${params.uuid}") {
              uuid,
              privateUuid,
              link {
                uuid,
                from { apiId, name, description, countryLong, lat, lng },
                to { apiId, name, description, countryLong, lat, lng} 
              },
              transport { slug },
              mode, identifier,
              departureDate, departureHour, departureMinute, departureDescription,
              departureLat, departureLng, departureAddress,
              arrivalDate, arrivalHour, arrivalMinute, arrivalDescription,
              arrivalLat, arrivalLng, arrivalAddress,
              priceAmount, priceCurrency,
              description,
              upVotes, downVotes,
              durationMinutes,
              isPrivate
            },
            transportTypes { slug },
            ratings(userUuid: "${userUuid || ''}", linkInstanceUuid: "${params.uuid}") {
              userUuid,
              linkInstanceUuid,
              avgRating,
              avgAvailabilityRating,
              avgDepartureRating,
              avgArrivalRating,
              avgAwesomeRating,
              userAvailabilityRating,
              userDepartureRating,
              userArrivalRating,
              userAwesomeRating
            },
            linkInstanceMedia(linkInstanceUuid: "${params.uuid}") {
              uuid,
              type,
              url
            },
            comments(linkInstanceUuid: "${params.uuid}") {
              uuid,
              replyToUuid,
              text,
              up, down,
              user {
                uuid,
                username,
                firstName,
                lastName
              }
            }
          }`
        );
        
        log.info("event=received-link-instance", "data:", data);
        
        const edit = params.action === 'edit';
        const props = { 
          edit, 
          linkInstance: data.linkInstance,
          ratings: data.ratings,
          linkInstanceMedia: data.linkInstanceMedia,
          comments: data.comments
        };
        
        if (edit) {
          props.transportTypes = data.transportTypes;
        }
        
        return <LinkInstance {...props} />;
    
      } else {
        
        const { data } = await graphqlRequest(
          `query {
            transportTypes { slug },
          }`
        );
        
        return <LinkInstance edit={true} 
          linkInstance={{}} 
          transportTypes={data.transportTypes} />;
      
      }

    } catch (error) {
      log.error(error);
      return <ErrorPage errors={error.errors} />
    }
  
  }

};
