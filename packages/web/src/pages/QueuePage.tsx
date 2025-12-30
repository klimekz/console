import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckIcon from '@mui/icons-material/Check';
import type { QueueItem } from '../types';
import { queueApi } from '../api/client';

const MONO = '"SF Mono", "Fira Code", monospace';

function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface QueueItemRowProps {
  item: QueueItem;
  onDelete: (id: string) => void;
  onMarkDone: (id: string) => void;
}

function QueueItemRow({ item, onDelete, onMarkDone }: QueueItemRowProps) {
  const displayTitle = item.title || item.url || item.content?.slice(0, 50) || 'Untitled';
  const isDone = item.status === 'done';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        px: 2,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        opacity: isDone ? 0.4 : 1,
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.02)',
        },
        '&:hover .actions': {
          opacity: 1,
        },
      }}
    >
      <IconButton
        size="small"
        onClick={() => onMarkDone(item.id)}
        sx={{
          color: isDone ? 'rgba(100,200,100,0.6)' : 'rgba(255,255,255,0.2)',
          '&:hover': {
            color: isDone ? 'rgba(100,200,100,0.8)' : 'rgba(100,200,100,0.6)',
          },
        }}
      >
        <CheckIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.8rem',
            color: '#fff',
            textDecoration: isDone ? 'line-through' : 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {displayTitle}
        </Typography>
        {item.url && item.url !== item.title && (
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.35)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {new URL(item.url).hostname.replace('www.', '')}
          </Typography>
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: MONO,
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.25)',
          flexShrink: 0,
        }}
      >
        {formatDate(item.createdAt)}
      </Typography>

      <Box
        className="actions"
        sx={{
          display: 'flex',
          gap: 0.5,
          opacity: 0,
          transition: 'opacity 0.15s',
        }}
      >
        {item.url && (
          <IconButton
            size="small"
            component="a"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'rgba(255,255,255,0.6)' } }}
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={() => onDelete(item.id)}
          sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'rgba(255,100,100,0.7)' } }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const data = await queueApi.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load queue:', err);
      setError('Failed to load queue');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadItems();
      setLoading(false);
    };
    init();
  }, [loadItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      const isLink = isUrl(text);
      const newItem = await queueApi.create({
        type: isLink ? 'link' : 'note',
        url: isLink ? (text.startsWith('www.') ? `https://${text}` : text) : undefined,
        content: isLink ? undefined : text,
        title: isLink ? undefined : text.slice(0, 100),
      });
      setItems((prev) => [newItem, ...prev]);
      setInputValue('');
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await queueApi.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleMarkDone = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newStatus = item.status === 'done' ? 'pending' : 'done';
    try {
      await queueApi.update(id, { status: newStatus });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const pendingItems = items.filter((i) => i.status !== 'done');
  const doneItems = items.filter((i) => i.status === 'done');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        color: '#fff',
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton
            component={Link}
            to="/"
            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h1"
            sx={{
              fontFamily: MONO,
              fontSize: '1.25rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            Queue
          </Typography>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.3)',
              ml: 'auto',
            }}
          >
            {pendingItems.length} pending
          </Typography>
        </Box>

        {/* Input area */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mb: 4 }}
        >
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder="Paste a link or type a note..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: MONO,
                fontSize: '0.85rem',
                bgcolor: 'rgba(255,255,255,0.03)',
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.3)',
                opacity: 1,
              },
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}
          />
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.25)',
              mt: 0.5,
              textAlign: 'right',
            }}
          >
            Press Cmd+Enter to add
          </Typography>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={24} sx={{ color: 'rgba(255,255,255,0.3)' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              Your queue is empty. Add links or notes above.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {pendingItems.map((item) => (
              <QueueItemRow
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onMarkDone={handleMarkDone}
              />
            ))}
            {doneItems.length > 0 && pendingItems.length > 0 && (
              <Box
                sx={{
                  py: 1,
                  px: 2,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.25)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Done ({doneItems.length})
                </Typography>
              </Box>
            )}
            {doneItems.map((item) => (
              <QueueItemRow
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onMarkDone={handleMarkDone}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
