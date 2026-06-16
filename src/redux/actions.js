import api from "../utils/api"

const playerId = localStorage.getItem('playerId')
// const tournamentId = localStorage.getItem('tournamentId')


// LOGIN
function decodeJWT(token) {
  try {
    const payloadBase64 = token.split('.')[1]; // Get the payload part
    const decodedPayload = atob(payloadBase64); // Decode Base64
    return JSON.parse(decodedPayload); // Parse JSON string
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

/** Avoid calling APIs with playerId=null / "null" / invalid ObjectId */
export function isValidMongoObjectId(id) {
  if (id == null || id === "") return false;
  const s = String(id).trim();
  if (!s || s === "null" || s === "undefined") return false;
  return /^[a-fA-F0-9]{24}$/.test(s);
}

export const sendOtp = ({ key, payload }) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key });

    try {
      const response = await api.post(
        "/webSiteApi/players/sendOtpToUser",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.success === false) {
        const msg = response?.data?.message || "Failed to send OTP";
        dispatch({ type: "API_ERROR", key, payload: msg });
        return { ok: false, error: { message: msg } };
      }

      dispatch({
        type: "API_SUCCESS",
        key,
        payload: response?.data?.data,
      });
      return { ok: true, data: response?.data?.data };
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to send OTP";
      dispatch({
        type: "API_ERROR",
        key,
        payload: msg,
      });
      return { ok: false, error: { message: msg } };
    }
  };
};


export const AuctionOverviewDetails = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionOverview" });

    try {
      const response = await api.get(
        `/webSiteApi/auction/overview/${auctionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer `,
          },
        }
      );
      dispatch({
        type: "API_SUCCESS",
        key: "auctionOverview",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionOverview",
        payload:
          error?.response?.data?.message ||
          "Failed to fetch profile",
      });
    }
  };
};

export const verifyOtp = ({ payload }) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "verify" });

    try {
      const response = await api.post(
        "/webSiteApi/players/verifyOtpAndLogin",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.success === false) {
        const msg =
          response?.data?.message || "Verification failed";
        dispatch({
          type: "API_ERROR",
          key: "verify",
          payload: msg,
        });
        return { ok: false, error: { message: msg } };
      }

      const token = response?.data?.data?.token;
      if (!token) {
        const msg = "No token received. Please try again.";
        dispatch({
          type: "API_ERROR",
          key: "verify",
          payload: msg,
        });
        return { ok: false, error: { message: msg } };
      }

      dispatch({
        type: "API_SUCCESS",
        key: "verify",
        payload: response?.data?.data,
      });

      localStorage.setItem("token", token);
      localStorage.setItem(
        "NewPlayer",
        JSON.stringify(response?.data?.data?.newPlayer),
      );

      const decoded = decodeJWT(token);
      const rawPid =
        decoded?.playerId ?? decoded?.id ?? decoded?._id ?? null;
      const pid = rawPid != null ? String(rawPid).trim() : "";

      if (!isValidMongoObjectId(pid)) {
        localStorage.removeItem("playerId");
        const msg = "Login response missing valid player id. Please try again.";
        dispatch({
          type: "API_ERROR",
          key: "verify",
          payload: msg,
        });
        return { ok: false, error: { message: msg } };
      }

      localStorage.setItem("playerId", pid);
      window.dispatchEvent(new Event("userLoggedIn"));
      window.dispatchEvent(new Event("crickbro-auth-change"));

      return { ok: true, data: response?.data?.data };
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to verify OTP";
      dispatch({
        type: "API_ERROR",
        key: "verify",
        payload: msg,
      });
      return { ok: false, error: { message: msg } };
    }
  };
};

export const fetchUserRole = (auctionId, playerId) => {

  return async (dispatch) => {
    if (!isValidMongoObjectId(auctionId) || !isValidMongoObjectId(playerId)) {
      return;
    }
    dispatch({ type: "API_START", key: "userRole" });
    const url = `/webSiteApi/auction/checkAuctionUserRole/${auctionId}/${playerId}`;
    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "userRole",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "userRole",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}



// Player Profile
export const fetchProfile = (playerId) => {
  return async (dispatch) => {
    if (!isValidMongoObjectId(playerId)) {
      const message = "Player not found";
      dispatch({
        type: "API_ERROR",
        key: "profile",
        payload: message,
        clearData: true,
      });
      localStorage.removeItem("userDetail");
      return { ok: false, error: { message } };
    }
    dispatch({ type: "API_START", key: "profile" });
    try {
      const response = await api.get(
        `/webSiteApi/players/profile?playerId=${encodeURIComponent(String(playerId).trim())}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer `,
          },
        }
      );

      const profile = response?.data?.data;
      if (
        response?.data?.success === false ||
        !profile ||
        typeof profile !== "object" ||
        Object.keys(profile).length === 0
      ) {
        const message = response?.data?.message || "Player not found";
        dispatch({
          type: "API_ERROR",
          key: "profile",
          payload: message,
          clearData: true,
        });
        localStorage.removeItem("userDetail");
        return { ok: false, error: { message } };
      }

      dispatch({
        type: "API_SUCCESS",
        key: "profile",
        payload: profile,
      });


      let obj = {
        name: profile.name,
        mobile: profile.mobile,
        profilePicture: profile.profilePicture,
        batchId: profile.batchId
      }
      localStorage.setItem('userDetail', JSON.stringify(obj));
      return { ok: true, data: profile };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to fetch profile";
      dispatch({
        type: "API_ERROR",
        key: "profile",
        payload: message,
        clearData: true,
      });
      localStorage.removeItem("userDetail");
      return { ok: false, error: { message } };
    }
  };
};

//Fetch Performance
export const fetchPerformance = (playerId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "myPerformance" });
    try {
      const response = await api.get(
        `/webSiteApi/auction/playerPerformance/${playerId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer `,
          },
        }
      );
      dispatch({
        type: "API_SUCCESS",
        key: "myPerformance",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "myPerformance",
        payload:
          error?.response?.data?.message ||
          "Failed to fetch profile",
      });
    }
  };
};

export const EnrollPlayer = (auctionId, formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "enrollPlayer" });

    const url = `/webSiteApi/auction/registerPlayer/${auctionId}`;
    const isMultipart = typeof FormData !== "undefined" && formData instanceof FormData;
    const config = isMultipart
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : {
          headers: {
            "Content-Type": "application/json",
          },
        };

    try {
      const response = await api.post(url, formData, config);

      dispatch({
        type: "API_SUCCESS",
        key: "enrollPlayer",
        payload: response?.data?.data,
      });

      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "enrollPlayer",
        payload:
          error?.response?.data?.message || "Something went wrong",
      });
      throw error;
    }
  };
};



// Auction Api
export const fetchAuctions = (tab, playerId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionList" });

    let url = "/webSiteApi/auction/list";

    if (tab === "my") {
      url += `?playerId=${playerId}&myAuction=true`;
    } else {
      url += `?status=${tab}`;
    }

    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "auctionList",
        payload: response?.data?.data,
      });
      return response?.data?.data;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionList",
        payload:
          error?.response?.data?.message || "Something went wrong",
      });
      return null;
    }
  };
};



export const fetchAuctionDetails = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionDetails" });
    const url = `/webSiteApi/auction/getAuctionById/${auctionId}`;
    try {
      const response = await api.get(url);
      // localStorage.setItem('tournamentId', response?.data?.data?.tournament?.id)
      dispatch({
        type: "API_SUCCESS",
        key: "auctionDetails",
        payload: response?.data?.data,
        tournamentId: response?.data?.data?.tournament?.id,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionDetails",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const fetchAllAdmin = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionAdmins" });
    const url = `/webSiteApi/auctionAdmin/getAdminsForAuction/${auctionId}`;
    try {
      const response = await api.get(url);
      dispatch({
        type: "API_SUCCESS",
        key: "auctionAdmins",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionAdmins",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

// export const fetchSlotList = (auctionId, page = 1, limit = 30,search="") => {
//   return async (dispatch) => {
//     dispatch({ type: "API_START", key: "slotList" });
//     const url = `/webSiteApi/auctionSlot/getListAuctionSlots?auctionId=${auctionId}&page=${page}&limit=${limit}&search=${search}`;
//     try {
//       const response = await api.get(url);
//       dispatch({
//         type: "API_SUCCESS",
//         key: "slotList",
//         payload: response?.data?.data,
//       });
//     } catch (error) {
//       dispatch({
//         type: "API_ERROR",
//         key: "slotList",
//         payload:
//           error?.response?.data?.message ||
//           "Something went wrong",
//       });
//     }
//   }
// }

export const fetchSlotList = (auctionId, page = 1, limit, search = "") => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "slotList" });

    let url = `/webSiteApi/auctionSlot/getListAuctionSlots?auctionId=${auctionId}&page=${page}`;

    if (limit) {
      url += `&limit=${limit}`;
    }

    if (search) {
      url += `&search=${search}`;
    }

    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "slotList",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "slotList",
        payload:
          error?.response?.data?.message || "Something went wrong",
      });
    }
  };
};

export const fetchAllSlots = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "allSlots" });

    let page = 1;
    let allData = [];
    let hasMore = true;

    try {
      while (hasMore) {
        const res = await api.get(
          `/webSiteApi/auctionSlot/getListAuctionSlots?auctionId=${auctionId}&page=${page}&limit=100`
        );

        const data = res?.data?.data?.data || [];

        allData = [...allData, ...data];

        if (data.length < 50) {
          hasMore = false;
        } else {
          page++;
        }
      }

      dispatch({
        type: "API_SUCCESS",
        key: "allSlots",
        payload: allData,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "allSlots",
        payload: "Something went wrong",
      });
    }
  };
};

export const fetchSlotSessions = (slotId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "sessions" });
    const url = `/webSiteApi/auctionSlot/getAuctionSlot/${slotId}`;
    try {
      const response = await api.get(url);
      dispatch({
        type: "API_SUCCESS",
        key: "sessions",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "sessions",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const updateAuctionTeam = (teamData, auctionId, teamId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "updateAuctionTeam" });

    const url = `/webSiteApi/auction/updateTeam/${auctionId}/${teamId}`; // Adjust endpoint as needed

    try {
      const response = await api.put(url, teamData);

      dispatch({
        type: "API_SUCCESS",
        key: "updateAuctionTeam",
        payload: response?.data?.data,
      });

      // Optional: Refresh auction teams after successful update
      if (teamData.auctionId) {
        dispatch(getAuctionTeams(teamData.auctionId));
      }

      return response?.data;

    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "updateAuctionTeam",
        payload:
          error?.response?.data?.message ||
          "Failed to update team",
      });
      throw error; // Re-throw error for component to catch
    }
  };
};

export const fetchAuctionPlayers = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionPlayers" });
    const url = `/webSiteApi/auction/getAuctionPlayers/${auctionId}`;
    try {
      const response = await api.get(url);
      dispatch({
        type: "API_SUCCESS",
        key: "auctionPlayers",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionPlayers",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const deletePlayer = (auctionId, id) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "deletePlayer" });

    const url = `/webSiteApi/auction/removePlayer/${auctionId}/${id}`;

    try {
      const response = await api.delete(url);

      dispatch({
        type: "API_SUCCESS",
        key: "deletePlayer",
        payload: response?.data?.data,
      });

      return response; // ✅ RESOLVE promise
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "deletePlayer",
        payload:
          error?.response?.data?.message || "Something went wrong",
      });

      return { data: { success: false } };
    }

  };
};



export const fetchAllSelectors = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionSelectors" });
    const url = `/webSiteApi/auctionSelector/getSelectorsForAuction/${auctionId}`;
    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "auctionSelectors",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionSelectors",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const fetchTeamsData = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "TeamData" });
    const url = `/webSiteApi/auctionTeam/getTeamsByOwnerInAuction/${auctionId}?playerId=${playerId}`;
    try {
      const response = await api.get(url);
      dispatch({
        type: "API_SUCCESS",
        key: "TeamData",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "TeamData",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const fetchAllTeamOwners = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionTeamOwners" });
    const url = `/webSiteApi/auctionTeam/getTeamOwnerList/${auctionId}`;
    try {
      const response = await api.get(url);
      dispatch({
        type: "API_SUCCESS",
        key: "auctionTeamOwners",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionTeamOwners",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const fetchPurchasedPlayers = (auctionId, selectedTeamId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "PurchasedPlayers" });
    const url = `/webSiteApi/auction/getAllPlayersAdmin/${auctionId}?teamId=${selectedTeamId}`;
    try {
      const response = await api.get(url);
      dispatch({
        type: "API_SUCCESS",
        key: "PurchasedPlayers",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "PurchasedPlayers",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const searchUserByMobile = (mobileNum) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "searchUser" });
    const url = `/webSiteApi/auctionAdmin/getPlayerByNameAndContact`;
    try {
      const response = await api.get(url, {
        params: { search: mobileNum },
      });
      dispatch({
        type: "API_SUCCESS",
        key: "searchUser",
        payload: response?.data?.data,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "searchUser",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const addAuctionAdmin = (auctionId, adminPayload) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "addAdmin" });
    const url = `/webSiteApi/auctionAdmin/addAdmin/${auctionId}`;
    const body = typeof adminPayload === "object" && !Array.isArray(adminPayload)
      ? adminPayload
      : { admin: adminPayload };
    try {
      const response = await api.post(url, body);
      dispatch({
        type: "API_SUCCESS",
        key: "addAdmin",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "addAdmin",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const removeAdmin = (auctionId, adminId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "removeAdmin" });

    try {
      const response = await api.post(
        `/webSiteApi/auctionAdmin/removeAdmin/${auctionId}`,
        {
          admin: adminId,
        }, // 👈 DELETE body goes in `data`

      );

      dispatch({
        type: "API_SUCCESS",
        key: "removeAdmin",
        payload: adminId,
      });

      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "removeAdmin",
        payload:
          error?.response?.data?.message || "Failed to remove admin",
      });
      throw error;
    }
  };
};

export const addAuctionSelector = (auctionId, adminPayload) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "addSelector" });
    const url = `/webSiteApi/auctionSelector/addSelector/${auctionId}`;
    const body = typeof adminPayload === "object" && !Array.isArray(adminPayload)
      ? adminPayload
      : { selector: adminPayload };
    try {
      const response = await api.post(url, body);
      dispatch({
        type: "API_SUCCESS",
        key: "addSelector",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "addSelector",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const removeSelector = (auctionId, selectorId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "removeSelector" });

    try {
      const response = await api.post(
        `/webSiteApi/auctionSelector/removeSelector/${auctionId}`,
        {
          selector: selectorId,
        }, // 👈 DELETE body goes in `data`

      );

      dispatch({
        type: "API_SUCCESS",
        key: "removeSelector",
        payload: selectorId,
      });

      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "removeSelector",
        payload:
          error?.response?.data?.message || "Failed to remove Selector",
      });
      throw error;
    }
  };
};



export const addTeamToAuction = (auctionId, selectedTeam) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "addTeams" });
    const url = `/webSiteApi/auction/addTeams/${auctionId}`;
    try {
      const response = await api.post(url, {
        teamsId: selectedTeam
      });
      dispatch({
        type: "API_SUCCESS",
        key: "addTeams",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "addTeams",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const addTeamOwner = (auctionId, selectedTeamId, adminPayload) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "addTeamOwner" });
    const url = `/webSiteApi/auctionTeam/addTeamOwner/${auctionId}`;
    const body = typeof adminPayload === "object" && !Array.isArray(adminPayload)
      ? adminPayload
      : {
        teamId: selectedTeamId,
        ownerId: adminPayload
      };
    try {
      const response = await api.post(url,
        body);
      dispatch({
        type: "API_SUCCESS",
        key: "addTeamOwner",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "addTeamOwner",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const EditRules = (auctionId, formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "editRules" });
    const url = `/webSiteApi/auction/updateAuctionRules/${auctionId}`;
    try {
      const response = await api.put(url, formData);
      dispatch({
        type: "API_SUCCESS",
        key: "editRules",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "editRules",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const removeTeamOwner = (auctionId, ownerId, teamId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "removeTeamOwner" });

    try {
      const response = await api.post(
        `/webSiteApi/auctionTeam/removeTeamOwner/${auctionId}`,
        {
          teamId: teamId,
          ownerId: ownerId,
        } // 👈 DELETE body goes in `data`

      );

      dispatch({
        type: "API_SUCCESS",
        key: "removeTeamOwner",
        payload: {
          teamId: teamId,
          ownerId: ownerId,
        },
      });

      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "removeTeamOwner",
        payload:
          error?.response?.data?.message || "Failed to remove team owner",
      });
      throw error;
    }
  };
};

export const UpateRating = (auctionId, formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "updateRating" });
    const url = `/webSiteApi/auction/updateTrailSettings/${auctionId}`;
    try {
      const response = await api.put(url, formData);
      dispatch({
        type: "API_SUCCESS",
        key: "updateRating",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "updateRating",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const createSlot = (formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "createSlot" });
    const url = `/webSiteApi/auctionSlot/createAuctionSlot`;
    try {
      const response = await api.post(url,
        formData);
      dispatch({
        type: "API_SUCCESS",
        key: "createSlot",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "createSlot",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

// redux action
export const updateSlotThunk = (slotId, formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "updateSlot" });

    const url = `/webSiteApi/auctionSlot/updateAuctionSlot/${slotId}`;
    try {
      const response = await api.put(url, formData);

      dispatch({
        type: "API_SUCCESS",
        key: "updateSlot",
        payload: response?.data?.data,
      });

      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "updateSlot",
        payload:
          error?.response?.data?.message || "Something went wrong",
      });
      throw error;
    }
  };
};

// Delete a slot
export const deleteSlot = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "deleteSlot" });
    const url = `/webSiteApi/auctionSlot/deleteAuctionSlot/${auctionId}`;
    try {
      const response = await api.delete(url);
      dispatch({
        type: "API_SUCCESS",
        key: "deleteSlot",
        payload: response?.data?.data,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "deleteSlot",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  };
};

export const createSession = (selectedId, formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "createSession" });
    const url = `/webSiteApi/auctionSlot/addSession/${selectedId}`;
    try {
      const response = await api.post(url,
        formData);
      dispatch({
        type: "API_SUCCESS",
        key: "createSession",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "createSession",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const editSession = (slotId, sessionId, sessionData) => {

  return async (dispatch) => {
    dispatch({ type: "API_START", key: "editSession" });

    try {
      const res = await api.put(
        `/webSiteApi/auctionSlot/updateSession/${slotId}/${sessionId}`,
        sessionData
      );

      dispatch({
        type: "API_SUCCESS",
        key: "editSession",
        payload: res?.data?.data,
      });

      return res;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "editSession",
        payload:
          error?.response?.data?.message || "Failed to update session",
      });
      throw error;
    }
  };
};

export const deleteSession = (slotId, sessionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "deleteSession" });
    const url = `/webSiteApi/auctionSlot/removeSession/${slotId}/${sessionId}`;
    try {
      const response = await api.delete(url);
      dispatch({
        type: "API_SUCCESS",
        key: "deleteSession",
        payload: response?.data?.data,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "deleteSession",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  };
};


export const getMyTournaments = () => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "myTournaments" });
    const url = `/webSiteApi/auction/listTournamentDropdown/${playerId}`;
    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "myTournaments",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "myTournaments",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const createAuction = (formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "createAuction" });
    const url = `/webSiteApi/auction/create`;
    try {
      const response = await api.post(url,
        formData);
      dispatch({
        type: "API_SUCCESS",
        key: "createAuction",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "createAuction",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const editAuction = (auctionId, formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "editAuction" });
    const url = `/webSiteApi/auction/edit/${auctionId}`;
    try {
      const response = await api.put(url,
        formData);
      dispatch({
        type: "API_SUCCESS",
        key: "editAuction",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "editAuction",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const createCategory = (formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "createCategory" });
    const url = `/webSiteApi/auctionCategory/createCategory`;
    try {
      const response = await api.post(url,
        formData
      );
      dispatch({
        type: "API_SUCCESS",
        key: "createCategory",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "createCategory",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const getCategories = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "categories" });
    const url = `/webSiteApi/auctionCategory/listCategories?auctionId=${auctionId}`;
    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "categories",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "categories",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const updateCategories = (data, editId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "updateCategories" });
    const url = `/webSiteApi/auctionCategory/updateCategory/${editId}`;
    try {
      const response = await api.put(url, data);

      dispatch({
        type: "API_SUCCESS",
        key: "updateCategories",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "updateCategories",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const deleteCategory = (deleteCategoryId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "deleteCategory" });
    const url = `/webSiteApi/auctionCategory/deleteCategory/${deleteCategoryId}`;
    try {
      const response = await api.delete(url);
      dispatch({
        type: "API_SUCCESS",
        key: "deleteCategory",
        payload: response?.data?.data,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "deleteCategory",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  };
};

export const getSelectorsSlot = (auctionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "mySlots" });
    const url = `/webSiteApi/auctionSelector/getSelectorAssignments/${auctionId}?selectorId=${playerId}`;
    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "mySlots",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "mySlots",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const getAuctionPlayers = ({
  auctionId,
  activePlayerTab,
  page = 1,
  itemsPerPage,
  statusSort,
  typeSort,
  debouncedSearch,
  slot,
  slotSession,
  
}) => {

  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionPlayers" });

    try {
      let url = `/webSiteApi/auction/getAuctionPlayers/${auctionId}`;

      const params = {
        limit: itemsPerPage,
        page,
      };

       if (slot) {
        params.slotId = slot;
      }
      
      if (slotSession) {
        params.sessionId = slotSession;
      }

      if (activePlayerTab === "unassigned") {
        params.trailStatus = "not-assign";
      } else if (activePlayerTab === "assigned") {
        params.trailStatus = "assign";

        if (statusSort) {
          if (statusSort === "all") {
            params.selectionStatus = "";
            params.playerType = "";
          } else if (
            statusSort === "pending" ||
            statusSort === "not reached"
          ) {
            params.selectionStatus = statusSort;
            params.playerType = "";
          } else {
            params.selectionStatus = statusSort;
          }
        }

        if (typeSort) {
          params.playerType = typeSort === "none" ? "" : typeSort;
        }
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const queryString = new URLSearchParams(params).toString();
      if (queryString) url += `?${queryString}`;

      const res = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "auctionPlayers",
        payload: {
          list: res?.data?.data?.data || [],
          pages: res?.data?.data?.pages || 0,
          total: res?.data?.data?.total || 0,
          page,
        },
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionPlayers",
        payload:
          error?.response?.data?.message ||
          "Failed to fetch players",
      });
    }
  };
};

// export const getAuctionTeams = (auctionId) => {
//   return async (dispatch) => {
//     dispatch({ type: "API_START", key: "auctionTeams" });
//     const url = `/webSiteApi/auction/getAuctionTeams/${auctionId}`;
//     try {
//       const response = await api.get(url);

//       dispatch({
//         type: "API_SUCCESS",
//         key: "auctionTeams",
//         payload: response?.data?.data,
//       });
//     } catch (error) {
//       dispatch({
//         type: "API_ERROR",
//         key: "auctionTeams",
//         payload:
//           error?.response?.data?.message ||
//           "Something went wrong",
//       });
//     }
//   }
// }


export const getAuctionTeams = (auctionId, page = 1, limit = 16, search = "") => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "auctionTeams" });

    const url = `/webSiteApi/auction/getAuctionTeams/${auctionId}?page=${page}&limit=${limit}&search=${search}`;

    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "auctionTeams",
        payload: response?.data, // expect { data, total, page, pages }
      });
      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "auctionTeams",
        payload:
          error?.response?.data?.message || "Something went wrong",
      });
    }
  };
};

export const getAllAuctionTeam = (tournamentId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "allAuctionTeams" });
    const url = `/webSiteApi/auction/getTeamList/${tournamentId}`;
    try {
      const response = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "allAuctionTeams",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "allAuctionTeams",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

// ── Ball-by-Ball Rating: fetch players in a session for dropdowns ──────────────
export const fetchSessionPlayersForBallRating = (auctionId, slotId, sessionId) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "sessionBallRatingPlayers" });
    const url = `/webSiteApi/auctionSelector/getPlayersBySelector/${auctionId}`;
    try {
      const response = await api.get(url, {
        params: { slotId, sessionId, limit: 200, page: 1 },
      });
      dispatch({
        type: "API_SUCCESS",
        key: "sessionBallRatingPlayers",
        payload: response?.data?.data?.data || [],
      });
      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "sessionBallRatingPlayers",
        payload: error?.response?.data?.message || "Failed to load players",
      });
    }
  };
};

// ── Ball-by-Ball Rating: submit all recorded ball events ─────────────────────
export const ratePlayerBallByBall = (auctionSlotId, sessionId, payload) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "ballByBallRating" });
    const url = `/webSiteApi/auctionSelector/ratePlayerBallByBall/${auctionSlotId}/${sessionId}`;
    try {
      const response = await api.post(url, payload);
      dispatch({
        type: "API_SUCCESS",
        key: "ballByBallRating",
        payload: response?.data?.data,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "ballByBallRating",
        payload: error?.response?.data?.message || "Failed to submit ball ratings",
      });
      throw error;
    }
  };
};

export const removePlayerRating = (auctionSlotId, sessionId, payload) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "removePlayerRating" });
    const url = `/webSiteApi/auctionSelector/removePlayerRating/${auctionSlotId}/${sessionId}`;
    try {
      const response = await api.post(url, payload);
      dispatch({
        type: "API_SUCCESS",
        key: "removePlayerRating",
        payload: response?.data?.data,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "removePlayerRating",
        payload: error?.response?.data?.message || "Failed to remove rating",
      });
      throw error;
    }
  };
};

// ── Ball-by-Ball Rating: fetch existing ratings for a player ─────────────────
export const fetchPlayerBallRatings = (auctionSlotId, sessionId, playerId) => {
  return async (dispatch) => {
    const url = `/webSiteApi/auctionSelector/getSessionPlayerBallRatings/${auctionSlotId}/${sessionId}`;
    try {
      const response = await api.get(url, {
        params: { playerId }
      });
      return response?.data?.data?.data || [];
    } catch (error) {
      console.log("No existing ratings found for player:", error?.message);
      return [];
    }
  };
};

export const getSelectorPlayers = (auctionId, page, search, itemsPerPage, filters = {}) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "selectorPlayers" });
    const url = `/webSiteApi/auctionSelector/getPlayersBySelector/${auctionId}`;
    try {
      const slotId = String(filters?.slotId || "").trim();
      const sessionId = String(filters?.sessionId || "").trim();
      const directSelectFilter = String(filters?.directSelectFilter || "").trim();
      const response = await api.get(url, {
        params: {
          selectorId: playerId,
          search: search,
          page: page,
          limit: itemsPerPage,
          ...(slotId ? { slotId } : {}),
          ...(sessionId ? { sessionId } : {}),
          ...(directSelectFilter ? { directSelectFilter } : {}),
        }
      });

      dispatch({
        type: "API_SUCCESS",
        key: "selectorPlayers",
        payload: response?.data?.data,
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "selectorPlayers",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    }
  }
}

export const AssignPlayersToTrails = (selectedSlot, selectedSession, payload) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "assignPlayersToTrial" });
    const url = selectedSession
      ? `/webSiteApi/auctionSlot/addPlayerToSession/${selectedSlot}/${selectedSession}`
      : `/webSiteApi/auctionSlot/addPlayerToSession/${selectedSlot}`;
    try {
      const response = await api.post(url, payload);
      dispatch({
        type: "API_SUCCESS",
        key: "assignPlayersToTrial",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "assignPlayersToTrial",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const importPlayer = (auctionId, file) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "importPlayers" });
    const url = (`/webSiteApi/auction/addPlayersViaExcel/${auctionId}`)
    try {
      const response = await api.post(url, file, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch({
        type: "API_SUCCESS",
        key: "importPlayers",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "importPlayers",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const addNewField = (auctionId, formData) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "addFields" });
    const url = `/webSiteApi/auction/addRatingFieldsToAuction/${auctionId}`;
    try {
      const response = await api.put(url, formData);
      dispatch({
        type: "API_SUCCESS",
        key: "addFields",
        payload: response?.data?.data,
      });
      return response;
    }
    catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "addFields",
        payload:
          error?.response?.data?.message ||
          "Something went wrong",
      });
      throw error;
    }
  }
}

export const getAuctionRatingFields = ({
  auctionId,
  page = 1,
  limit = 20,
  search = "",
  fieldType = "",
  type = "",
  appliesTo = "",
  hasOptions = "",
}) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "ratingFieldsList" });

    try {
      let url = `/webSiteApi/auction/getRatingFields/${auctionId}`;

      const params = {
        page,
        limit,
      };

      if (search?.trim()) params.search = search.trim();
      if (fieldType) params.fieldType = fieldType;
      if (type) params.type = type;
      if (appliesTo) params.appliesTo = appliesTo;
      if (hasOptions !== "") params.hasOptions = hasOptions;

      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await api.get(url);
      const payload = response?.data?.data || {};

      dispatch({
        type: "API_SUCCESS",
        key: "ratingFieldsList",
        payload: {
          list: payload?.data || [],
          page: payload?.page || 1,
          pages: payload?.pages || 1,
          total: payload?.total || 0,
          limit: payload?.limit || limit,
        },
      });

      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "ratingFieldsList",
        payload:
          error?.response?.data?.message ||
          "Failed to load rating fields",
      });
      throw error;
    }
  };
};

export const getSelectedPlayers = ({
  auctionId,
  page = 1,
  itemsPerPage = 8,
  debouncedUnassignPlayer,
  searchUnassign,
  typeFilter,
  fromRating,
  toRating,
  slotFilter,
  slotSessionFilter,
  directSelectedCheckbox,
  directSelectedGradeFilter,
}) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "selectedPlayers" });

    try {
      let url = `/webSiteApi/auction/getSelectPlayers/${auctionId}`;

      // ✅ params MUST be declared before use
      const params = {
        categoryFilter: "notassignincategory",
        page,
        limit: itemsPerPage,
      };

      // 🔍 Search
      const searchValue = debouncedUnassignPlayer || searchUnassign;
      if (searchValue) {
        params.search = searchValue;
      }

      // 🎯 Player Type Filter
      if (typeFilter) {
        params.playerType = typeFilter;
      }

      // ⭐ Rating Filters
      if (fromRating !== "") {
        params.ratingFrom = fromRating;
      }

      if (toRating !== "") {
        params.ratingTo = toRating;
      }

      // 🕒 Slot Filters
      if (slotFilter) {
        params.slotId = slotFilter;
      }

      if (slotSessionFilter) {
        params.sessionId = slotSessionFilter;
      }

      // 🎯 Direct Selected Filters
      if (directSelectedCheckbox) {
        params.directSelected = 'true';
      }

      if (directSelectedGradeFilter) {
        params.directSelectedGrade = directSelectedGradeFilter;
      }

      // ✅ Convert params object → query string
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "selectedPlayers",
        payload: {
          list: res?.data?.data?.data || [],
          page: res?.data?.data?.page || 1,
          pages: res?.data?.data?.pages || 1,
          total: res?.data?.data?.total || 0,
        },
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "selectedPlayers",
        payload:
          error?.response?.data?.message ||
          "Failed to load unassigned players",
      });
    }
  };
};

export const getUnassignedinCategory = ({
  auctionId,
  page = 1,
  itemsPerPage = 8,
  debouncedUnassignPlayer,
  searchUnassign,
  typeFilter,

}) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "unassignedPlayers" });

    try {
      let url = `/webSiteApi/auction/getAuctionPlayers/${auctionId}`;

      // ✅ params MUST be declared before use
      const params = {
        categoryFilter: "notassignincategory",
        page,
        limit: itemsPerPage,
      };

      // 🔍 Search
      const searchValue = debouncedUnassignPlayer || searchUnassign;
      if (searchValue) {
        params.search = searchValue;
      }
      // 🎯 Player Type Filter
      if (typeFilter) {
        params.playerType = typeFilter;
      }


      // ✅ Convert params object → query string
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await api.get(url);


      dispatch({
        type: "API_SUCCESS",
        key: "unassignedPlayers",
        payload: {
          list: res?.data?.data?.data || [],
          page: res?.data?.data?.page || 1,
          pages: res?.data?.data?.pages || 1,
          total: res?.data?.data?.total || 0,
        },
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "unassignedPlayers",
        payload:
          error?.response?.data?.message ||
          "Failed to load unassigned players",
      });
    }
  };
};

export const getAssignedinCategory = ({
  auctionId,
  page = 1,
  itemsPerPage = 8,
  debouncedAssignPlayer,
  searchAssign,
  typeFilter,
  fromRating,
  toRating,
  categorySearchId,
  slotFilter,
  slotSessionFilter,
  directSelectedCheckbox,
  directSelectedGradeFilter,
}) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "assignedinCategory" });

    try {
      let url = `/webSiteApi/auction/getSelectPlayers/${auctionId}`;

      const params = {
        categoryFilter: "assignincategory",
        page,
        limit: itemsPerPage,
      };

      const searchValue = debouncedAssignPlayer || searchAssign;
      if (searchValue) params.search = searchValue;

      if (typeFilter) params.playerType = typeFilter;
      if (fromRating !== "") params.ratingFrom = fromRating;
      if (toRating !== "") params.ratingTo = toRating;
      if (categorySearchId) params.categoryId = categorySearchId;
      if (slotFilter) params.slotId = slotFilter;
      if (slotSessionFilter) params.sessionId = slotSessionFilter;
      if (directSelectedCheckbox) params.directSelected = 'true';
      if (directSelectedGradeFilter) params.directSelectedGrade = directSelectedGradeFilter;

      url += `?${new URLSearchParams(params).toString()}`;

      const res = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "assignedinCategory",
        payload: {
          list: res?.data?.data?.data || [],
          page: res?.data?.data?.page || 1,
          pages: res?.data?.data?.pages || 1,
          total: res?.data?.data?.total || 0,
        },
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "assignedinCategory",
        payload:
          error?.response?.data?.message ||
          "Failed to load assigned players",
      });
    }
  };
};



export const getAssignedPlayers = ({
  auctionId,
  page = 1,
  itemsPerPage = 8,
  debouncedAssignPlayer,
  searchAssign,
  typeFilter,
  fromRating,
  toRating,
  categorySearchId,
  slotFilter,
  slotSessionFilter,
  directSelectedCheckbox,
  directSelectedGradeFilter,
}) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "assignedPlayers" });

    try {
      let url = `/webSiteApi/auction/getAuctionPlayers/${auctionId}`;

      const params = {
        categoryFilter: "assignincategory",
        page,
        limit: itemsPerPage,
      };

      // 🔍 Search
      const searchValue = debouncedAssignPlayer || searchAssign;
      if (searchValue) params.search = searchValue;

      // 🎯 Filters
      if (typeFilter) params.playerType = typeFilter;
      if (fromRating !== "") params.ratingFrom = fromRating;
      if (toRating !== "") params.ratingTo = toRating;
      if (categorySearchId) params.categoryId = categorySearchId;
      if (slotFilter) params.slotId = slotFilter;
      if (slotSessionFilter) params.sessionId = slotSessionFilter;
      if (directSelectedCheckbox) params.directSelected = 'true';
      if (directSelectedGradeFilter) params.directSelectedGrade = directSelectedGradeFilter;

      url += `?${new URLSearchParams(params).toString()}`;

      const res = await api.get(url);

      dispatch({
        type: "API_SUCCESS",
        key: "assignedPlayers",
        payload: {
          list: res?.data?.data?.data || [],
          page: res?.data?.data?.page || 1,
          pages: res?.data?.data?.pages || 1,
          total: res?.data?.data?.total || 0,
        },
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "assignedPlayers",
        payload:
          error?.response?.data?.message ||
          "Failed to load assigned players",
      });
    }
  };
};


export const getCategoryPlayers = (
  categoryId,
  page = 1,
  limit = 20,
  selectedStatus = "",
  searchParticularPlayer = ""
) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "categoryPlayers" });

    // ✅ Proper URL construction (NO line breaks)
    const params = new URLSearchParams({
      page,
      limit,
      status: selectedStatus,
      search: searchParticularPlayer,
    }).toString();

    const url = `/webSiteApi/auctionCategory/getPlayersByCategory/${categoryId}?${params}`;
    try {
      const response = await api.get(url);
      dispatch({
        type: "API_SUCCESS",
        key: "categoryPlayers",
        payload: response?.data?.data, // keep full object
      });
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "categoryPlayers",
        payload:
          error?.response?.data?.message || "Something went wrong",
      });
    }
  };
};

export const updatePlayerDirectSelect = (auctionId, updates) => {
  return async (dispatch) => {
    dispatch({ type: "API_START", key: "updateDirectSelect" });

    try {
      const response = await api.post(`/webSiteApi/auction/updatePlayerDirectSelect/${auctionId}`, {
        updates
      });

      dispatch({
        type: "API_SUCCESS",
        key: "updateDirectSelect",
        payload: response?.data?.data,
      });

      return response;
    } catch (error) {
      dispatch({
        type: "API_ERROR",
        key: "updateDirectSelect",
        payload: error?.response?.data?.message || "Failed to update player selections",
      });
      throw error;
    }
  };
};






















