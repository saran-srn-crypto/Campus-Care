import { useEffect, useMemo, useState } from 'react';
import { studentComplaintService } from '../services/studentComplaintService';

const EMPTY_META = {
  page: 0,
  size: 10,
  totalPages: 0,
  totalElements: 0,
  last: true,
};

function buildCounts(items) {
  const counts = { All: items.length, Open: 0, Assigned: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
  items.forEach(item => {
    if (Object.prototype.hasOwnProperty.call(counts, item.status)) counts[item.status] += 1;
  });
  return counts;
}

function normalizeResponse(data, page, size) {
  if (Array.isArray(data)) {
    return {
      complaints: data,
      meta: {
        page,
        size,
        totalPages: Math.max(1, Math.ceil(data.length / size)),
        totalElements: data.length,
        last: true,
      },
      statusCounts: buildCounts(data),
    };
  }

  const content = data?.content || [];
  return {
    complaints: content,
    meta: {
      page: data?.page ?? page,
      size: data?.size ?? size,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? content.length,
      last: data?.last ?? true,
    },
    statusCounts: data?.statusCounts || buildCounts(content),
  };
}

export function useStudentComplaints(params) {
  const page = params.page || 0;
  const size = params.size || 10;
  const [complaints, setComplaints] = useState([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    let cancelled = false;
    async function load(isSilent = false) {
      if (!isSilent) {
        setLoading(true);
        setError('');
      }
      try {
        const data = await studentComplaintService.fetchComplaints(params);
        if (cancelled) return;
        const normalized = normalizeResponse(data, page, size);
        setComplaints(normalized.complaints);
        setMeta(normalized.meta);
        setStatusCounts(normalized.statusCounts);
        if (isSilent) setError('');
      } catch (err) {
        if (cancelled) return;
        if (!isSilent) {
          setComplaints([]);
          setMeta({ ...EMPTY_META, page, size });
          setStatusCounts({});
          setError(err.message || 'Unable to load complaints.');
        }
      } finally {
        if (!cancelled && !isSilent) {
          setLoading(false);
        }
      }
    }
    load(false);

    const interval = setInterval(() => {
      load(true);
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [queryKey, reloadKey, page, size]);

  return {
    complaints,
    meta,
    statusCounts,
    loading,
    error,
    refetch: () => setReloadKey(key => key + 1),
  };
}
