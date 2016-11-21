import log from '../../core/log';
import React from 'react';
import LinkInstance from './LinkInstance';
import ErrorPage from '../../components/common/ErrorPage';
import fetch from '../../core/fetch';

export default {

  path: '/link-instance/:id?/:action?',

  async action({ params, context }) {
    
    const { graphqlRequest } = context.store.helpers;
    
    const getTransportTypes = async () => {

      const { data } = await graphqlRequest(
        `query {
          transportTypes 
          { id, slug }
        }`
      );

      return data.transportTypes;

    };
    
    try { 
    
      if (params.id) {
        
        const { data } = await graphqlRequest(
          `query {
            linkInstance(id: ${params.id}) {
              id,
              link {
                from { id, apiId, name, description, countryLong, lat, lng },
                to { id, apiId, name, description, countryLong, lat, lng} 
              },
              transport { slug },
              departureDate, departureHour, departureMinute, departurePlace,
              arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
              priceAmount, priceCurrency,
              description,
              avgRating,
              durationMinutes
            }
          }`
        );
        
        log.info("received link instance", data);
        
        const edit = params.action === 'edit';
        const props = { edit, linkInstance: data.linkInstance };
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
