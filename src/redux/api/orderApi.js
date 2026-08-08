import { apiSlice } from "./apiSlice";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: () => "/orders",
      providesTags: ["Orders"],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ["Orders"],
    }),
    updateOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/orders/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Orders", "Invoice","Materials"],
    }),
    createOrder: builder.mutation({
      query: (data) => ({
        url: "/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    getMaterials: builder.query({
      query: () => "/materials",
    }),
    getServices: builder.query({
      query: () => "/services",
    }),
  }),
});

export const { 
  useGetOrdersQuery, 
  useGetOrderByIdQuery,
  useUpdateOrderMutation, 
  useCreateOrderMutation,
  useGetMaterialsQuery,
  useGetServicesQuery
} = orderApi;
