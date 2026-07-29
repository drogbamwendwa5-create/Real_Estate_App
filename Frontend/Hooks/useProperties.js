import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProperties, setFeaturedProperties, setCurrentProperty, setLoading } from '../store/slices/propertySlice';
import PropertyService from '../services/api/propertyService';

export const useProperties = () => {
  const dispatch = useDispatch();
  const { properties, featuredProperties, currentProperty, loading, totalPages, currentPage } = useSelector((state) => state.property);

  const fetchProperties = useCallback(async (params = {}) => {
    dispatch(setLoading(true));
    try {
      const data = await PropertyService.getProperties(params);
      dispatch(setProperties({ properties: data.data, totalPages: data.totalPages, currentPage: params.page || 1 }));
      return data;
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  const fetchProperty = useCallback(async (id) => {
    dispatch(setLoading(true));
    try {
      const data = await PropertyService.getProperty(id);
      dispatch(setCurrentProperty(data));
      return data;
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  const createProperty = useCallback(async (data) => {
    try {
      const result = await PropertyService.createProperty(data);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateProperty = useCallback(async (id, data) => {
    try {
      const result = await PropertyService.updateProperty(id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteProperty = useCallback(async (id) => {
    try {
      const result = await PropertyService.deleteProperty(id);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const fetchMyProperties = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await PropertyService.getMyProperties();
      dispatch(setProperties({ properties: data.data, totalPages: 1, currentPage: 1 }));
      return data;
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  const fetchFeatured = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await PropertyService.getFeaturedProperties();
      dispatch(setFeaturedProperties(data.data));
      dispatch(setLoading(false));
      return data;
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  return {
    properties,
    featuredProperties,
    currentProperty,
    loading,
    totalPages,
    currentPage,
    fetchProperties,
    fetchProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    fetchMyProperties,
    fetchFeatured,
  };
};
