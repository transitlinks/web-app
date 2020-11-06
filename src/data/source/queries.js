export const TRIP_QUERY_FROM = `FROM "Trip" t, "CheckIn" ci, "CheckIn" fci, "CheckIn" lci`;
export const TRIP_QUERY_WHERE = `
  AND ci."userId" = t."userId"
  AND fci.id = t."firstCheckInId"
  AND lci.id = t."lastCheckInId"
  AND ci."createdAt" BETWEEN fci."createdAt" AND lci."createdAt"
`;

export const OPEN_TRIP_QUERY_FROM = `FROM "Trip" t, "CheckIn" ci, "CheckIn" fci`;
export const OPEN_TRIP_QUERY_WHERE = `
  AND ci."userId" = t."userId"
  AND fci.id = t."firstCheckInId"
  AND ci."createdAt" >= fci."createdAt"
`;

export const getTripQuery = (id, withPhotos) => {
  return `
    ${TRIP_QUERY_FROM} ${withPhotos ? ', "Post" p, "MediaItem" mi' : ''}
            WHERE t.id = ${id}
            ${TRIP_QUERY_WHERE}
            ${withPhotos ? 'AND p."checkInId" = ci.id AND mi."entityUuid" = p."uuid"::varchar' : ''}
  `;
};

export const getOpenTripQuery = (id, withPhotos) => {
  return `
    ${OPEN_TRIP_QUERY_FROM} ${withPhotos ? ', "Post" p, "MediaItem" mi' : ''}
            WHERE t.id = ${id}
            ${OPEN_TRIP_QUERY_WHERE}
            ${withPhotos ? 'AND p."checkInId" = ci.id AND mi."entityUuid" = p."uuid"::varchar' : ''}
  `;
};
