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
  const counts = { All: items.length, Pending: 0, Open: 0, Assigned: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
  items.forEach(item => {
    const status = item.status;
    if (Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status] += 1;
    }
    if (['Open', 'Assigned', 'In Progress', 'Reopened', 'Pending Assignment'].some(s => s.toLowerCase() === (status || '').toLowerCase())) {
      counts.Pending += 1;
    }
  });
  return counts;
}

function normalizeResponse(data, page, size) {
  if (Array.isArray(data)) {
    const statusCounts = buildCounts(data);
    return {
      complaints: data,
      meta: {
        page,
        size,
        totalPages: Math.max(1, Math.ceil(data.length / size)),
        totalElements: data.length,
        last: true,
      },
      statusCounts,
    };
  }

  const content = data?.content || [];
  const rawCounts = data?.statusCounts || buildCounts(content);
  // Sum Open + Assigned + In Progress (and any Reopened/Pending Assignment if present in keys)
  const pendingCount = (rawCounts.Open || 0) + (rawCounts.Assigned || 0) + (rawCounts['In Progress'] || 0) + (rawCounts.Reopened || 0) + (rawCounts['Pending Assignment'] || 0);
  const statusCounts = {
    ...rawCounts,
    Pending: pendingCount,
  };

  return {
    complaints: content,
    meta: {
      page: data?.page ?? page,
      size: data?.size ?? size,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? content.length,
      last: data?.last ?? true,
    },
    statusCounts,
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

    return () => {
      cancelled = true;
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
