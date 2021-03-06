import { createParamString } from '../../core/utils';

export const createQuery = (queries) => {

  return `query {
    ${queries.join(`
    `)}
  }`;

};

export const getActiveTripQuery = () => {
  return `
    activeTrip {
      uuid,
      name
    }
  `;
};

export const getSearchLocalitiesQuery = (search, from) => {
  return `
    searchLocalities (search:"${search}") {
      uuid,
      name,
      nameLong
    }
  `;
};

export const getTripCoordEntity = () => {
  return `
    {
      latitude,
      longitude
    }
  `;
};

export const getTripEntity = () => {
  return  `
    {
      uuid,
      name,
      firstCheckIn {
        uuid,
        locality,
        formattedAddress
      },
      lastCheckIn {
        uuid,
        locality,
        formattedAddress
      }
    }
  `;
};

export const getCommentEntity = () => {
  return `
    {
      uuid,
      replyToUuid,
      checkInUuid,
      terminalUuid,
      text,
      likes,
      likedByUser,
      user {
        uuid,
        firstName,
        lastName,
        username,
        photo
      }
    }
  `;
};

export const getCommentsQuery = () => {
  return `
    comments ${getCommentEntity()}
  `;
};

export const getCheckInEntity = () => {
  return `
    {
      uuid,
      clientId,
      user {
        uuid,
        username,
        firstName,
        lastName,
        photo,
        avatar,
        avatarSource
      },
      userUuid,
      userImage,
      date,
      latitude,
      longitude
      placeId,
      formattedAddress,
      locality,
      localityUuid,
      country,
      tags,
      likes,
      likedByUser,
      departure {
        uuid,
        localDateTime,
        locality,
        formattedAddress,
        transport
      }
      trip ${getTripEntity()}
      comments ${getCommentEntity()}
      
    }
  `;
};

export const getFeedItemEntity = () => {
  return `
    {
      userAccess,
      checkIn ${getCheckInEntity()},
      inbound {
        uuid,
        latitude,
        longitude,
        placeId,
        formattedAddress,
        locality,
        country,
        tags
      },
      outbound {
        uuid,
          latitude,
          longitude,
          placeId,
          formattedAddress,
          locality,
          country
      },
      posts {
        uuid,
          text,
          user,
          mediaItems {
          uuid,
            type,
            url,
            latitude,
            longitude,
            hosting,
            date
        }
      },
      terminals {
        uuid,
          type,
          transport,
          transportId,
          description,
          localDateTime,
          utcDateTime,
          priceAmount,
          priceCurrency,
          priceType,
          priceTerminal {
            uuid,
            transport,
            transportId,
            description,
            priceAmount,
            priceCurrency
          }
          comments ${getCommentEntity()},
          linkedTerminal {
          uuid,
            type,
            transport,
            transportId,
            description,
            localDateTime,
            utcDateTime,
            priceAmount,
            priceCurrency,
            checkIn {
            uuid,
              latitude,
              longitude,
              placeId,
              formattedAddress,
              locality,
              country
          }
        }
      }
    }`;
};

export const getFeedItemsQuery = () => {
  return `feedItems ${getFeedItemEntity()}`;
};

export const getFeedItemQuery = (checkInUuid) => {
  return `feedItem (checkInUuid:"${checkInUuid}") ${getFeedItemEntity()}`;
};


export const getDiscoverQuery = (params) => {
  return `
    discover ${createParamString(params)} {
      discoveries {
        groupType,
        groupName,
        groupId,
        checkInCount,
        postCount,
        connectionCount,
        localityCount,
        localities,
        tags {
          tag,
          userUuid
        },
        trips {
          uuid,
          name
        },
        feedItem ${getFeedItemEntity()},
        posts {
          uuid,
          text,
          user,
          mediaItems {
            uuid,
            type,
            hosting,
            url
          },
          checkIn {
            uuid
          }
        },
        connectionsFrom,
        connectionsTo
      },
      localityOffset,
      countryOffset,
      tagOffset,
      tripOffset,
      userOffset
    }
  `;
};

export const getLinksQuery = (params) => {

  const query = {
    ...params
  };

  delete query.view;
  delete query.route;

  const paramsString = createParamString(query);

  return `
    transitLinks ${paramsString} {
      searchResultType,
      locality,
      localityLong,
      localityUuid,
      linkedLocality,
      from,
      to,
      fromName,
      toName,
      user,
      userImage,
      tripName,
      links {
        localityUuid,
        locality,
        localityLong,
        latitude,
        longitude,
        routeId,
        routeCost,
        departures {
          uuid,
          type,
          latitude,
          longitude,
          localityUuid,
          locality,
          localityLong,
          transport,
          transportId,
          priceAmount,
          priceCurrency,
          routeId,
          routeCost,
          routeIndex,
          localDateTime,
          utcDateTime,
          checkInUuid,
          formattedAddress,
          description,
          linkCount,
          reverseLinkCount,
          linkedTerminal {
            latitude,
            longitude,
            localityUuid,
            locality,
            localityLong,
            transport,
            transportId,
            priceAmount,
            priceCurrency,
            localDateTime,
            utcDateTime,
            checkInUuid,
            formattedAddress,
            description
          }
          route { lat, lng },
          tags { tag, userUuid },
          trips { uuid, name },
          comments ${getCommentEntity()}
        },
        arrivals {
          uuid,
          type,
          latitude,
          longitude,
          localityUuid,
          locality,
          localityLong,
          transport,
          transportId,
          priceAmount,
          priceCurrency,
          localDateTime,
          utcDateTime,
          checkInUuid,
          formattedAddress,
          description,
          linkCount,
          reverseLinkCount,
          routeId,
          routeCost,
          routeIndex,
          linkedTerminal {
            uuid,
            latitude,
            longitude,
            localityUuid,
            locality,
            localityLong,
            transport,
            transportId,
            priceAmount,
            priceCurrency,
            localDateTime,
            utcDateTime,
            checkInUuid,
            formattedAddress,
            description
          }
          route { lat, lng },
          tags { tag, userUuid },
          trips { uuid, name },
          comments ${getCommentEntity()}
        },
        internal {
          uuid,
          latitude,
          longitude,
          localityUuid,
          locality,
          localityLong,
          transport,
          transportId,
          priceAmount,
          priceCurrency,
          localDateTime,
          utcDateTime,
          checkInUuid,
          formattedAddress,
          description,
          linkCount,
          routeId,
          routeCost,
          routeIndex,
          linkedTerminal {
            uuid,
            latitude,
            longitude,  
            localityUuid,
            locality,
            localityLong,
            transport,
            transportId,
            priceAmount,
            priceCurrency,
            localDateTime,
            utcDateTime,
            checkInUuid,
            formattedAddress,
            description
          }
          route { lat, lng },
          comments ${getCommentEntity()}
        },
        departureCount,
        arrivalCount,
        linkedDepartures {
          localityUuid,
          locality,
          localityLong,
          linkedLocalityLong,
          linkedLocalityUuid,
          linkedLocality,
          from,
          to,
          linkedTerminalType,
          linkedTerminalUuid,
          linkedLocalityLatitude,
          linkedLocalityLongitude,
          linkCount
        },
        linkedArrivals { 
          localityUuid,
          locality,
          localityLong,
          linkedLocalityUuid,
          linkedLocality,
          linkedLocalityLong,
          from,
          to,
          linkedTerminalType,
          linkedTerminalUuid,
          linkedLocalityLatitude,
          linkedLocalityLongitude,
          linkCount
        },
        tags { tag, userUuid },
        trips { uuid, name }
      }
    }
  `;

};

export const getTripsQuery = (params) => {
  const query = { ...params };
  const queryStr = createParamString(query);
  return `trips ${queryStr} ${getTripEntity()}`;
};
