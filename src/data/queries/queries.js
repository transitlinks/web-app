export const createQuery = (queries) => {

  return `query {
    ${queries.join(`
    `)}
  }`;

}

export const getFeedItemQuery = (checkInUuid) => {

  const query = `
        feedItem (checkInUuid:"${checkInUuid}") {
          userAccess,
          checkIn {
            uuid,
            user,
            userUuid,
            userImage,
            date,
            latitude,
            longitude
            placeId,
            formattedAddress,
            locality,
            country
          },
          inbound {
            uuid,
            latitude,
            longitude,
            placeId,
            formattedAddress,
            locality,
            country
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
