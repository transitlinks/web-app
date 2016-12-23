export const requireOwnership = (request, uuid) => {

  if (!(request.user && request.user.uuid === uuid)) {
    throw new Error("access-denied");
  }

};
