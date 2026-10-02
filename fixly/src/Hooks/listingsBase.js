import { getRole } from "./loginApi";

/**
 * Where "back to listings" goes after add/edit.
 * Use in AddListingPage instead of hard-coded paths:
 *   navigate(listingsBase())
 */
export const listingsBase = () =>
  getRole() === "shop_owner" ? "/shop/listings" : "/admin/marketplace";

/** Edit route for a listing, by role */
export const editListingPath = (id) =>
  getRole() === "shop_owner"
    ? `/shop/listings/edit/${id}`
    : `/dashboard/marketplace/edit/${id}`;

export const addListingPath = () =>
  getRole() === "shop_owner" ? "/shop/listings/new" : "/dashboard/marketplace/add";