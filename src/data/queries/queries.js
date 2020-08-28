import { createParamString } from '../../core/utils';

export const createQuery = (queries) => {

  return `query {
    ${queries.join(`
    `)}
  }`;

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
      user,
      userUuid,
      userImage,
      date,
      latitude,
      longitude
      placeId,
      formattedAddress,
      locality,
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
        checkInCount,
        postCount,
        connectionCount,
        localityCount,
        localities,
        tags {
          tag,
          userUuid
        },
        feedItem ${getFeedItemEntity()},
        posts {
          uuid,
          text,
          user,
          mediaItems {
            uuid,
            type,
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
      tagOffset,
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
      linkedLocality,
      from,
      to,
      user,
      userImage,
      links {
        locality,
        latitude,
        longitude,
        routeId,
        departures {
          uuid,
          type,
          latitude,
          longitude,
          locality,
          transport,
          transportId,
          priceAmount,
          priceCurrency,
          routeId,
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
            locality,
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
          comments ${getCommentEntity()}
        },
        arrivals {
          uuid,
          type,
          latitude,
          longitude,
          locality,
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
          routeIndex,
          linkedTerminal {
            uuid,
            latitude,
            longitude,
            locality,
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
          comments ${getCommentEntity()}
        },
        internal {
          uuid,
          latitude,
          longitude,
          locality,
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
          routeIndex,
          linkedTerminal {
            uuid,
            latitude,
            longitude,
            locality,
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
          locality,
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
          locality,
          linkedLocality,
          from,
          to,
          linkedTerminalType,
          linkedTerminalUuid,
          linkedLocalityLatitude,
          linkedLocalityLongitude,
          linkCount
        },
        tags { tag, userUuid }
      }
    }
  `;

};

export const getTripsQuery = (params) => {
  const query = { ...params };
  const queryStr = createParamString(query);
  return `trips ${queryStr} ${getTripEntity()}`;
};
