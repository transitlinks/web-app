export function graphqlReduce(
  state, action,
  valueMap,
  START_CODE, SUCCESS_CODE, ERROR_CODE
) {
  
  const endState = {
    ...state
  };
  
  switch (action.type) {
    
    case START_CODE: {
      const start = valueMap.start();
      Object.keys(start).forEach(key => {
        endState[key] = start[key];
      });
      return endState;
    }

    case SUCCESS_CODE: {
      const success = valueMap.success();
      Object.keys(success).forEach(key => {
        endState[key] = success[key];
      });
      return endState;
    }

    case ERROR_CODE: {
      const error = valueMap.error();
      Object.keys(error).forEach(key => {
        endState[key] = error[key];
      });
      return Object.assign(endState, {
        error: action.payload.error
      });
    }

    default: {
      return endState;
    }

  }

}
