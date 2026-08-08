import { apiSlice } from "./apiSlice";

export const billingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query({
      query: () => "/user/invoices",
      providesTags: ["Invoice"],
    }),
    getAdminInvoices: builder.query({
      query: () => "/admin/invoices",
      providesTags: ["Invoice", "Payment"],
    }),
    getInvoiceById: builder.query({
      query: (id) => `/invoices/${id}`,
      providesTags: ["Invoice"],
    }),
    recordPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/admin/payments",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Invoice", "Payment", "Order"],
    }),
    getPayments: builder.query({
      query: () => "/admin/payments",
      providesTags: ["Payment"],
    }),
    getEmployeeWages: builder.query({
      query: () => "/admin/wages",
      providesTags: ["User"],
    }),
    getExpenses: builder.query({
      query: () => "/admin/expenses",
      providesTags: ["Expense"],
    }),
    addExpense: builder.mutation({
      query: (data) => ({
        url: "/admin/expenses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Expense"],
    }),
    getMyWages: builder.query({
      query: () => "/employee/wages",
      providesTags: ["Expense"],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetAdminInvoicesQuery,
  useGetInvoiceByIdQuery,
  useRecordPaymentMutation,
  useGetPaymentsQuery,
  useGetEmployeeWagesQuery,
  useGetExpensesQuery,
  useAddExpenseMutation,
  useGetMyWagesQuery,
} = billingApi;

