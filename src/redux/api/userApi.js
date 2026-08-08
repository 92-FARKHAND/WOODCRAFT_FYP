import { apiSlice } from "./apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateStatus: builder.mutation({
      query: (data) => ({
        url: "/user/update-status",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/user/update-profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/user/change-password",
        method: "POST",
        body: data,
      }),
    }),
    getAdminUsers: builder.query({
      query: (role) => `/admin/users${role ? `?role=${role}` : ""}`,
      providesTags: ["User"],
    }),
    updateUserAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUserAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    clockIn: builder.mutation({
      query: () => ({
        url: "/employee/clock-in",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    clockOut: builder.mutation({
      query: () => ({
        url: "/employee/clock-out",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    payEmployee: builder.mutation({
      query: (employeeId) => ({
        url: "/admin/wages",
        method: "POST",
        body: { employeeId },
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useUpdateStatusMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAdminUsersQuery,
  useUpdateUserAdminMutation,
  useDeleteUserAdminMutation,
  useClockInMutation,
  useClockOutMutation,
  usePayEmployeeMutation,
  useRegisterMutation,
} = userApi;
