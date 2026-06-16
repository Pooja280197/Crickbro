const initialState = {
  loading: {},   // 👈 per API loading
  error: {},     // 👈 per API error
  data: {},      // 👈 per API data
  tournamentId: null,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "API_START":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.key]: true,
        },
        error: {
          ...state.error,
          [action.key]: null,
        },
      };

    // case "API_SUCCESS":
    //   return {
    //     ...state,
    //     loading: {
    //       ...state.loading,
    //       [action.key]: false,
    //     },
    //     data: {
    //       ...state.data,
    //       [action.key]: action.payload,
    //     },
    //   };
    case "API_SUCCESS":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.key]: false,
        },
        data: {
          ...state.data,
          [action.key]: action.payload,
        },
        ...(action.tournamentId && {
          tournamentId: action.tournamentId,
        }),
      };

    case "API_ERROR":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.key]: false,
        },
        error: {
          ...state.error,
          [action.key]: action.payload,
        },
        ...(action.clearData && {
          data: {
            ...state.data,
            [action.key]: null,
          },
        }),
      };

    case "LOGOUT":
      return initialState;

    default:
      return state;
  }
}
