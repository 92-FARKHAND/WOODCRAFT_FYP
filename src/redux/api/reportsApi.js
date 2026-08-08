import { apiSlice } from "./apiSlice";

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query({
      query: (months = 6) => `/admin/reports?months=${months}`,
      providesTags: ["Reports"],
    }),
    getExpenses: builder.query({
      query: () => "/admin/expenses",
      providesTags: ["Expenses"],
    }),
    addExpense: builder.mutation({
      query: (expense) => ({
        url: "/admin/expenses",
        method: "POST",
        body: expense,
      }),
      invalidatesTags: ["Reports"],
    }),
    payWage: builder.mutation({
      query: (data) => ({
        url: "/admin/wages",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reports", "Users"],
    }),
    getDashboardStats: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetExpensesQuery,
  useAddExpenseMutation,
  usePayWageMutation,
  useGetDashboardStatsQuery,
} = reportsApi;
