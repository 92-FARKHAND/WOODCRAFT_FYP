import { apiSlice } from "./apiSlice";

export const materialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMaterials: builder.query({
      query: () => "/materials",
      providesTags: ["Materials"],
    }),
    getMaterial: builder.query({
      query: (id) => `/materials/${id}`,
      providesTags: (result, error, id) => [{ type: "Materials", id }],
    }),
    createMaterial: builder.mutation({
      query: (data) => ({
        url: "/materials",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Materials"],
    }),
    updateMaterial: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/materials/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Materials", { type: "Materials", id }],
    }),
    deleteMaterial: builder.mutation({
      query: (id) => ({
        url: `/materials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Materials"],
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = materialApi;
