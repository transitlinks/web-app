import { createParamString } from '../../core/utils';

export const createQuery = (queries) => {

  return `query {
    ${queries.join(`
    `)}
  }`;

}

export const getCommentsQuery = () => {
  return `
    comments {
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

export const getCheckInQuery = () => {
  return `
    checkIn {
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
      ${getCommentsQuery()}
    }
  `;
};

export const getFeedItemsQuery = (topLevelQuery) => {
  const topLevelQueryStr = topLevelQuery || 'feedItems {';
  const query = `
        ${topLevelQueryStr}
          userAccess,
          ${getCheckInQuery()},
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
            date,
            time,
            priceAmount,
            priceCurrency,
            ${getCommentsQuery()},
            linkedTerminal {
              uuid,
              type,
              transport,
              transportId,
              description,
              date,
              time,
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
        }
    `;

  return query;
};

export const getFeedItemQuery = (checkInUuid) => {

  const topLevelQuery = checkInUuid ?
    `feedItem (checkInUuid:"${checkInUuid}") {` :
    'feedItem {';

  return getFeedItemsQuery(topLevelQuery);

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
        ${getFeedItemQuery()},
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

  const paramsString = createParamString(params);

  return `
    transitLinks ${paramsString} {
      searchResultType,
      locality,
      linkedLocality,
      links {
        locality,
        latitude,
        longitude,
        departures {
          type,
          latitude,
          longitude,
          locality,
          transport,
          transportId,
          priceAmount,
          priceCurrency,
          date,
          time,
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
            date,
            time,
            checkInUuid,
            formattedAddress,
            description
          }
          route { lat, lng },
          tags { tag, userUuid },
          ${getCommentsQuery()}
        },
        arrivals {
          type,
          latitude,
          longitude,
          locality,
          transport,
          transportId,
          priceAmount,
          priceCurrency,
          date,
          time,
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
            date,
            time,
            checkInUuid,
            formattedAddress,
            description
          }
          route { lat, lng },
          tags { tag, userUuid },
          ${getCommentsQuery()}
        },
        internal {
          latitude,
          longitude,
          locality,
          transport,
          transportId,
          priceAmount,
          priceCurrency,
          date,
          time,
          checkInUuid,
          formattedAddress,
          description,
          linkCount,
          linkedTerminal {
            latitude,
            longitude,
            locality,
            transport,
            transportId,
            priceAmount,
            priceCurrency,
            date,
            time,
            checkInUuid,
            formattedAddress,
            description
          }
          route { lat, lng },
          ${getCommentsQuery()}
        },
        departureCount,
        arrivalCount,
        linkedDepartures {
          locality,
          linkedLocality,
          linkedTerminalType,
          linkedTerminalUuid,
          linkedLocalityLatitude,
          linkedLocalityLongitude,
          linkCount
        },
        linkedArrivals {
          locality,
          linkedLocality,
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
