import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pyramid.devfolio.net/api/';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Product', 'Order', 'Ride', 'Parcel', 'BusTrip', 'Booking', 'LocalService', 'ClassifiedAd', 'ChatMessage', 'Vendor', 'BusinessType', 'Property', 'Category', 'AuthSetting', 'LoyaltySetting', 'Currency'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/local',
        method: 'POST',
        body: credentials,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        return `/users?populate=role&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
      },
      providesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getProducts: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        return `/products?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
      },
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/products/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (documentId) => ({
        url: `/products/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    getOrders: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        return `/orders?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
      },
      providesTags: ['Order'],
    }),
    updateOrder: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/orders/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Order'],
    }),
    updateSubOrder: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/sub-orders/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Order'],
    }),
    getVendors: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        return `/vendors?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
      },
      providesTags: ['Vendor'],
    }),
    createVendor: builder.mutation({
      query: (data) => ({
        url: '/vendors',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['Vendor'],
    }),
    updateVendor: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/vendors/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Vendor'],
    }),
    deleteVendor: builder.mutation({
      query: (documentId) => ({
        url: `/vendors/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vendor'],
    }),
    getBusinessTypes: builder.query({
      query: () => '/business-types?populate=*',
      providesTags: ['BusinessType'],
    }),
    createBusinessType: builder.mutation({
      query: (data) => ({
        url: '/business-types',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['BusinessType'],
    }),
    updateBusinessType: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/business-types/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['BusinessType'],
    }),
    deleteBusinessType: builder.mutation({
      query: (documentId) => ({
        url: `/business-types/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BusinessType'],
    }),
    getProperties: builder.query({
      query: () => '/properties?publicationState=preview&populate=*',
      providesTags: ['Property'],
    }),
    updateProperty: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/properties/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Property'],
    }),
    deleteProperty: builder.mutation({
      query: (documentId) => ({
        url: `/properties/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Property'],
    }),
    getCategories: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        return `/categories?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
      },
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/categories/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (documentId) => ({
        url: `/categories/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    getRides: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        let url = `/rides?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
        return url;
      },
      providesTags: ['Ride'],
    }),
    createRide: builder.mutation({
      query: (data) => ({
        url: '/rides',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['Ride'],
    }),
    updateRide: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/rides/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Ride'],
    }),
    deleteRide: builder.mutation({
      query: (documentId) => ({
        url: `/rides/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ride'],
    }),
    getParcels: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        let url = `/parcel-bookings?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
        return url;
      },
      providesTags: ['Parcel'],
    }),
    createParcel: builder.mutation({
      query: (data) => ({
        url: '/parcel-bookings',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['Parcel'],
    }),
    updateParcel: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/parcel-bookings/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Parcel'],
    }),
    deleteParcel: builder.mutation({
      query: (documentId) => ({
        url: `/parcel-bookings/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Parcel'],
    }),
    getBusTrips: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        return `/bus-trips?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
      },
      providesTags: ['BusTrip'],
    }),
    createBusTrip: builder.mutation({
      query: (data) => ({
        url: '/bus-trips',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['BusTrip'],
    }),
    updateBusTrip: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/bus-trips/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['BusTrip'],
    }),
    deleteBusTrip: builder.mutation({
      query: (documentId) => ({
        url: `/bus-trips/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BusTrip'],
    }),
    getBookings: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        return `/reservations?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
      },
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation({
      query: (data) => ({
        url: '/reservations',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBooking: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/reservations/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Booking'],
    }),
    deleteBooking: builder.mutation({
      query: (documentId) => ({
        url: `/reservations/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),
    getLocalServices: builder.query({
      query: () => '/local-services?populate=*',
      providesTags: ['LocalService'],
    }),
    updateLocalService: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/local-services/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['LocalService'],
    }),
    getClassifiedAds: builder.query({
      query: () => '/classified-ads?populate=*',
      providesTags: ['ClassifiedAd'],
    }),
    updateClassifiedAd: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/classified-ads/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['ClassifiedAd'],
    }),
    getChatMessages: builder.query({
      query: () => '/chat-messages?populate=*',
      providesTags: ['ChatMessage'],
    }),
    createChatMessage: builder.mutation({
      query: (data) => ({
        url: '/chat-messages',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['ChatMessage'],
    }),
    getAuthSetting: builder.query({
      query: () => '/auth-setting?populate=*',
      providesTags: ['AuthSetting'],
    }),
    updateAuthSetting: builder.mutation({
      query: (patch) => ({
        url: '/auth-setting',
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['AuthSetting'],
    }),
    getLoyaltySetting: builder.query({
      query: () => '/loyalty-setting?populate=*',
      providesTags: ['LoyaltySetting'],
    }),
    updateLoyaltySetting: builder.mutation({
      query: (patch) => ({
        url: '/loyalty-setting',
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['LoyaltySetting'],
    }),
    getCurrencies: builder.query({
      query: (params) => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 25;
        return `/currencies?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`;
      },
      providesTags: ['Currency'],
    }),
    createCurrency: builder.mutation({
      query: (data) => ({
        url: '/currencies',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['Currency'],
    }),
    updateCurrency: builder.mutation({
      query: ({ documentId, ...patch }) => ({
        url: `/currencies/${documentId}`,
        method: 'PUT',
        body: { data: patch },
      }),
      invalidatesTags: ['Currency'],
    }),
    deleteCurrency: builder.mutation({
      query: (documentId) => ({
        url: `/currencies/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Currency'],
    }),
    uploadFile: builder.mutation({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const { 
  useLoginMutation,
  useChangePasswordMutation,
  useGetUsersQuery,
  useGetMeQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useUpdateSubOrderMutation,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetBusinessTypesQuery,
  useCreateBusinessTypeMutation,
  useUpdateBusinessTypeMutation,
  useDeleteBusinessTypeMutation,
  useGetPropertiesQuery,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetRidesQuery,
  useCreateRideMutation,
  useUpdateRideMutation,
  useDeleteRideMutation,
  useGetParcelsQuery,
  useCreateParcelMutation,
  useUpdateParcelMutation,
  useDeleteParcelMutation,
  useGetBusTripsQuery,
  useCreateBusTripMutation,
  useUpdateBusTripMutation,
  useDeleteBusTripMutation,
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useGetLocalServicesQuery,
  useUpdateLocalServiceMutation,
  useGetClassifiedAdsQuery,
  useUpdateClassifiedAdMutation,
  useGetChatMessagesQuery,
  useCreateChatMessageMutation,
  useGetAuthSettingQuery,
  useUpdateAuthSettingMutation,
  useGetLoyaltySettingQuery,
  useUpdateLoyaltySettingMutation,
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useUploadFileMutation
} = api;
