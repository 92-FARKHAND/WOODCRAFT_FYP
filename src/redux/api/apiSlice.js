import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
});

const customBaseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.data) {
    if (result.data.success) {
      result.data = result.data.data;
    } else {
      return {
        error: {
          status: 400,
          data: result.data.error || "Something went wrong",
        },
      };
    }
  }

  // If the request failed (e.g. 4xx, 5xx)
  if (result.error) {
    if (result.error.data && typeof result.error.data === "object" && result.error.data.error) {
      result.error.data = result.error.data.error;
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  tagTypes: ["User", "Orders", "Materials", "Services", "Suppliers", "Invoice", "Payment", "Notification", "Expense", "Expenses", "Reports", "Dashboard"],
  endpoints: (builder) => ({}),
});
