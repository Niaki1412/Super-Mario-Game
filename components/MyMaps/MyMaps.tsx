

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMyMaps, deleteMap, restoreMap, publishMap, uploadFile, MapListItem, getPublicMaps, PublicMapListItem, getUserProfile, getAuditMaps, AuditMapListItem, submitToAudit, auditMap } from '../../api';
import { ArrowLeft, Edit, Trash2, Map as MapIcon, Plus, Globe, Upload, X, Loader2, Image as ImageIcon, CheckCircle, AlertTriangle, EyeOff, Activity, Ban, RotateCcw, ChevronLeft, ChevronRight, FileEdit, LayoutGrid, Gamepad2, ImageOff, Calendar, ShieldAlert, Send } from 'lucide-react';

export const MyMaps: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab State derived from URL to persist across refreshes
  const activeTab = searchParams.get('tab') || 'drafts';

  // User Role State
  const [userRole, setUserRole] = useState<string>('0');

  // Drafts Data
  const [maps, setMaps] = useState<MapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Published Maps Data
  const [publishedMaps, setPublishedMaps] = useState<PublicMapListItem[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(false);

  // Audit Maps Data
  const [auditMaps, setAuditMaps] = useState<AuditMapListItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Pagination State (Drafts only)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Toast State
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
          setToast(current => current?.id === id ? null : current);
      }, 3000);
  };

  // Publish Modal State
  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
  const [publishForm, setPublishForm] = useState({ title: '', description: '' });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // --- Data Fetching ---

  useEffect(() => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          navigate('/');
          return;
      }
      
      // Fetch User Role
      getUserProfile(token).then(profile => {
          setUserRole(profile.role);
      }).catch(console.error);
  }, []);

  const fetchDrafts = async (page: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      setLoading(true);
      // Status -1 to get all maps (deleted and active)
      const data = await getMyMaps(token, -1, page, pageSize);
      setMaps(data.list || []);
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.page || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load maps.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublished = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
          setLoadingPublished(true);
          // dataScope = 1 for current user
          const data = await getPublicMaps(1, token);
          setPublishedMaps(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoadingPublished(false);
      }
  };

  const fetchAuditMapsData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
          setLoadingAudit(true);
          const data = await getAuditMaps(token);
          setAuditMaps(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoadingAudit(false);
      }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (activeTab === 'drafts') {
        fetchDrafts(currentPage);
    } else if (activeTab === 'published') {
        fetchPublished();
    } else if (activeTab === 'audit') {
        fetchAuditMapsData();
    }
  }, [navigate, activeTab, currentPage]);

  // --- Handlers ---

  const handleEdit = (id: number) => {
    navigate(`/editor?id=${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this map?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await deleteMap({ map_id: id }, token);
      fetchDrafts(currentPage);
      showToast('Map deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete map', 'error');
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm('Are you sure you want to restore this map?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await restoreMap({ map_id: id }, token);
      fetchDrafts(currentPage);
      showToast('Map restored successfully', 'success');
    } catch (err) {
      showToast('Failed to restore map', 'error');
    }
  };

  const handlePlayPublished = (publicId: number) => {
      navigate(`/game?public_id=${publicId}`);
  };

  const handleSubmitAudit = async (publicMapId: number) => {
      if (!window.confirm('Submit this map for moderator review?')) return;
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
          await submitToAudit(publicMapId, token);
          showToast('Submitted for audit successfully!', 'success');
          fetchPublished(); // Refresh to update status
      } catch (e) {
          showToast('Failed to submit for audit', 'error');
      }
  };

  const handleAudit = async (publicMapId: number, status: number) => {
      const action = status === 2 ? 'Approve' : 'Reject';
      if (!window.confirm(`Are you sure you want to ${action} this map?`)) return;
      
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
          await auditMap({
              publish_map_id: publicMapId,
              audit_status: status
          }, token);
          showToast(`Map ${action}d successfully`, 'success');
          fetchAuditMapsData();
      } catch