import log from '../../core/log';
import React from 'react';
import LinkInstance from './LinkInstance';
import ErrorPage from '../../components/common/ErrorPage';
import fetch from '../../core/fetch';

const getRatings = async (graphqlRequest, linkInstanceUuid, userUuid) => {

  const { data } = await graphqlRequest(
    `query {
      ratings(userUuid: "${userUuid || ''}", linkInstanceUuid: "${linkInstanceUuid}") {
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
      }
    }`
  );

  log.info("event=received-link-instance-ratings", "data:", data);

  return data.ratings;

};

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
    
    const getTransportTypes = async () => {

      const { data } = await graphqlRequest(
        `query {
          transportTypes { slug }
        }`
      );

      return data.transportTypes;

    };
    
    try { 
    
      if (params.uuid) {
        
        const { data } = await graphqlRequest(
          `query {
            linkInstance(uuid: "${params.uuid}") {
              uuid,
              link {
                from { apiId, name, description, countryLong, lat, lng },
                to { apiId, name, description, countryLong, lat, lng} 
              },
              transport { slug },
              departureDate, departureHour, departureMinute, departurePlace,
              arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
              priceAmount, priceCurrency,
              description,
              durationMinutes
            }
          }`
        );
        
        log.info("event=received-link-instance", "data:", data);
        
        const ratings = await getRatings(graphqlRequest, params.uuid, userUuid); 
        
        const edit = params.action === 'edit';
        const props = { edit, linkInstance: data.linkInstance, ratings };
        
        if (edit) {
          props.transportTypes = await getTransportTypes();
        }
        
        return <LinkInstance {...props} />;
    
      } else {
        
        return <LinkInstance edit={true} 
          linkInstance={{}} 
          transportTypes={await getTransportTypes()} />;
      
      }

    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }
  
  }

};
