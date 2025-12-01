
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
    getMyMaps, deleteMap, restoreMap, publishMap, uploadFile, 
    MapListItem, getPublicMaps, PublicMapListItem, getUserProfile, 
    getAuditMaps, AuditMapListItem, submitToAudit, auditMap,
    PublishIn
} from '../../api';

export const useMyMaps = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'drafts';

  // User & Role
  const [userRole, setUserRole] = useState<string>('0');

  // Data States
  const [drafts, setDrafts] = useState<MapListItem[]>([]);
  const [publishedMaps, setPublishedMaps] = useState<PublicMapListItem[]>([]);
  const [auditMaps, setAuditMaps] = useState<AuditMapListItem[]>([]);
  
  // Loading & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination (Drafts)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Toast
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
          setToast(current => current?.id === id ? null : current);
      }, 3000);
  }, []);

  const setTab = (tab: string) => {
      setSearchParams({ tab });
  };

  // --- Initial Auth & Role Check ---
  useEffect(() => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          navigate('/');
          return;
      }
      getUserProfile(token).then(profile => {
          setUserRole(profile.role);
      }).catch(console.error);
  }, [navigate]);

  // --- Fetchers ---
  const fetchDrafts = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      setLoading(true);
      const data = await getMyMaps(token, -1, currentPage, pageSize);
      setDrafts(data.list || []);
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.page || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load drafts.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchPublished = useCallback(async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
          setLoading(true);
          const data = await getPublicMaps(1, token);
          setPublishedMaps(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  }, []);

  const fetchAudit = useCallback(async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
          setLoading(true);
          const data = await getAuditMaps(token);
          setAuditMaps(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  }, []);

  // --- Effect to trigger fetch on tab/page change ---
  useEffect(() => {
    if (activeTab === 'drafts') fetchDrafts();
    else if (activeTab === 'published') fetchPublished();
    else if (activeTab === 'audit') fetchAudit();
  }, [activeTab, fetchDrafts, fetchPublished, fetchAudit]);

  // --- Actions ---

  const deleteDraft = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this map?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await deleteMap({ map_id: id }, token);
      fetchDrafts();
      showToast('Map deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete map', 'error');
    }
  };

  const restoreDraft = async (id: number) => {
    if (!window.confirm('Are you sure you want to restore this map?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await restoreMap({ map_id: id }, token);
      fetchDrafts();
      showToast('Map restored successfully', 'success');
    } catch (err) {
      showToast('Failed to restore map', 'error');
    }
  };

  const submitAudit = async (publicMapId: number) => {
      if (!window.confirm('Submit this map for moderator review?')) return;
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
          await submitToAudit(publicMapId, token);
          showToast('Submitted for audit successfully!', 'success');
          fetchPublished();
      } catch (e) {
          showToast('Failed to submit for audit', 'error');
      }
  };

  const performAudit = async (publicMapId: number, status: number) => {
      const action = status === 2 ? 'Approve' : 'Reject';
      if (!window.confirm(`Are you sure you want to ${action} this map?`)) return;
      
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
          await auditMap({ publish_map_id: publicMapId, audit_status: status }, token);
          showToast(`Map ${action}d successfully`, 'success');
          fetchAudit();
      } catch (e) {
          showToast(`Failed to ${action} map`, 'error');
      }
  };

  const executePublish = async (data: PublishIn, coverFile: File | null) => {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("No token");

      let coverUrl = '';
      if (coverFile) {
          const uploadData = await uploadFile(coverFile, token);
          coverUrl = uploadData.url;
      }

      await publishMap({ ...data, cover: coverUrl }, token);
      showToast('Map published successfully!', 'success');
      fetchDrafts();
  };

  return {
      activeTab, setTab,
      userRole,
      drafts, publishedMaps, auditMaps,
      loading, error,
      pagination: { currentPage, setCurrentPage, totalPages },
      toast,
      actions: {
          deleteDraft,
          restoreDraft,
          submitAudit,
          performAudit,
          executePublish
      }
  };
};
