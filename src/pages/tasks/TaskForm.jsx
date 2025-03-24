import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, Users, Check, X, ChevronDown, ChevronUp, Upload, Paperclip, Trash2 } from 'lucide-react';
import { fetchUsers } from '../../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../../store/slices/inspectionLevelSlice';
import { fetchAssets } from '../../../store/slices/assetSlice';
import { createTask, updateTask } from '../../../store/slices/taskSlice';
import { toast } from 'react-hot-toast';
import * as Skeleton from '../../../components/common/Skeleton';

const TaskForm = ({ initialData = {}, onCancel, submitButtonText = 'Create Task', isEdit = false, usersProp = [], inspectionLevelsProp = [] }) => {
  const dispatch = useDispatch();
  const userDropdownRef = useRef(null);
  
  const { users = [] } = useSelector(state => state.users);
  const { levels: inspectionLevels = [] } = useSelector(state => state.inspectionLevels);
  const { assets = [] } = useSelector(state => state.assets);
  const { loading: taskLoading } = useSelector(state => state.tasks);
  
  const initialLoading = users.length === 0 && usersProp.length === 0;
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set default form data with proper asset handling
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    deadline: initialData.deadline ? new Date(initialData.deadline) : new Date(),
    assignedTo: initialData.assignedTo?.map(user => typeof user === 'object' ? user._id : user) || [],
    status: initialData.status || 'pending',
    priority: initialData.priority || 'medium',
    location: initialData.location || '',
    inspectionLevel: initialData.inspectionLevel?._id || initialData.inspectionLevel || '',
    asset: initialData.asset?._id || initialData.asset || '',
    attachments: initialData.attachments || [],
  });

  useEffect(() => {
    if (users.length === 0 && usersProp.length === 0) {
      dispatch(fetchUsers());
    }
    if (inspectionLevels?.length === 0 && inspectionLevelsProp.length === 0) {
      dispatch(fetchInspectionLevels());
    }
    if (assets?.length === 0) {
      dispatch(fetchAssets());
    }
  }, [dispatch, users.length, inspectionLevels?.length, assets?.length, usersProp.length, inspectionLevelsProp.length]);
  
  // Debug initial values
  useEffect(() => {
    console.log('TaskForm initialData:', initialData);
    console.log('Asset ID from initial data:', initialData.asset?._id);
    console.log('Current formData:', formData);
  }, [initialData]);

  // ... rest of the existing code ...
} 