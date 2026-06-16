import api from "./api";

/** Fetches every auction team page (API default limit is 20). */
export async function fetchAllAuctionTeams(auctionId, options = {}) {
  const url = `/webSiteApi/auction/getAuctionTeams/${auctionId}`;
  const limit = Math.min(200, options.limit || 200);
  let page = 1;
  let hasMore = true;
  const allTeams = [];
  let categoryBudgetLocks;
  let soldPlayersByTeamCategory;
  let total = 0;

  while (hasMore) {
    const response = await api.get(url, {
      params: {
        page,
        limit,
        ...(options.search ? { search: options.search } : {}),
      },
    });

    const payload = response?.data?.data;
    const pageItems = Array.isArray(payload?.data) ? payload.data : [];
    allTeams.push(...pageItems);

    if (payload?.categoryBudgetLocks) {
      categoryBudgetLocks = payload.categoryBudgetLocks;
    }
    if (payload?.soldPlayersByTeamCategory) {
      soldPlayersByTeamCategory = payload.soldPlayersByTeamCategory;
    }
    total = payload?.total ?? allTeams.length;

    const totalPages = payload?.pages || 0;
    if (totalPages > 0) {
      hasMore = page < totalPages;
    } else {
      hasMore = pageItems.length === limit;
    }
    page += 1;
  }

  return {
    total,
    page: 1,
    pages: 1,
    data: allTeams,
    ...(categoryBudgetLocks && { categoryBudgetLocks }),
    ...(soldPlayersByTeamCategory && { soldPlayersByTeamCategory }),
  };
}
