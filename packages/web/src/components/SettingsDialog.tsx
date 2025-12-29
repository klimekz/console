import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  Chip,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  Collapse,
  InputAdornment,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { ResearchConfig, CategoryType } from '../types';
import { CATEGORY_LABELS } from '../types';
import { configsApi, reportsApi } from '../api/client';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onResearchTriggered?: () => void;
}

interface ChipInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder: string;
  chips: string[];
  onRemove: (chip: string) => void;
  variant?: 'default' | 'success' | 'error';
}

function ChipInput({ value, onChange, onAdd, placeholder, chips, onRemove, variant = 'default' }: ChipInputProps) {
  const chipColor = variant === 'success' ? '#e8f5e9' : variant === 'error' ? '#ffebee' : undefined;
  const chipTextColor = variant === 'success' ? '#2e7d32' : variant === 'error' ? '#c62828' : undefined;

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: chips.length > 0 ? 1.5 : 0 }}>
        {chips.map((chip) => (
          <Chip
            key={chip}
            label={chip}
            onDelete={() => onRemove(chip)}
            size="small"
            sx={{
              fontFamily: SYSTEM_FONT,
              fontSize: '0.75rem',
              height: 24,
              bgcolor: chipColor,
              color: chipTextColor,
              '& .MuiChip-deleteIcon': {
                color: chipTextColor,
                opacity: 0.7,
                '&:hover': { opacity: 1 },
              },
            }}
          />
        ))}
      </Box>
      <TextField
        size="small"
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAdd();
          }
        }}
        InputProps={{
          endAdornment: value.trim() ? (
            <InputAdornment position="end">
              <KeyboardReturnIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </InputAdornment>
          ) : null,
          sx: { fontFamily: SYSTEM_FONT, fontSize: '0.875rem' },
        }}
      />
    </Box>
  );
}

export function SettingsDialog({ open, onClose, onResearchTriggered }: SettingsDialogProps) {
  const [configs, setConfigs] = useState<ResearchConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState<Record<string, string>>({});
  const [newPreferredSource, setNewPreferredSource] = useState<Record<string, string>>({});
  const [newBlockedSource, setNewBlockedSource] = useState<Record<string, string>>({});
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      loadConfigs();
    }
  }, [open]);

  const loadConfigs = async () => {
    try {
      const data = await configsApi.getAll();
      setConfigs(data);
    } catch {
      setError('Failed to load configurations');
    }
  };

  const handleToggle = async (config: ResearchConfig) => {
    try {
      const updated = await configsApi.update(config.id, { enabled: !config.enabled });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch {
      setError('Failed to update configuration');
    }
  };

  const handleScheduleChange = async (config: ResearchConfig, schedule: string) => {
    try {
      const updated = await configsApi.update(config.id, { schedule });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch {
      setError('Failed to update schedule');
    }
  };

  const handleAddTopic = async (config: ResearchConfig) => {
    const topic = newTopic[config.id]?.trim();
    if (!topic) return;

    try {
      const updated = await configsApi.update(config.id, {
        topics: [...config.topics, topic],
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
      setNewTopic((prev) => ({ ...prev, [config.id]: '' }));
    } catch {
      setError('Failed to add topic');
    }
  };

  const handleRemoveTopic = async (config: ResearchConfig, topicToRemove: string) => {
    try {
      const updated = await configsApi.update(config.id, {
        topics: config.topics.filter((t) => t !== topicToRemove),
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch {
      setError('Failed to remove topic');
    }
  };

  const handleAddPreferredSource = async (config: ResearchConfig) => {
    const source = newPreferredSource[config.id]?.trim().toLowerCase();
    if (!source) return;

    try {
      const updated = await configsApi.update(config.id, {
        preferredSources: [...(config.preferredSources || []), source],
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
      setNewPreferredSource((prev) => ({ ...prev, [config.id]: '' }));
    } catch {
      setError('Failed to add preferred source');
    }
  };

  const handleRemovePreferredSource = async (config: ResearchConfig, sourceToRemove: string) => {
    try {
      const updated = await configsApi.update(config.id, {
        preferredSources: (config.preferredSources || []).filter((s) => s !== sourceToRemove),
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch {
      setError('Failed to remove preferred source');
    }
  };

  const handleAddBlockedSource = async (config: ResearchConfig) => {
    const source = newBlockedSource[config.id]?.trim().toLowerCase();
    if (!source) return;

    try {
      const updated = await configsApi.update(config.id, {
        blockedSources: [...(config.blockedSources || []), source],
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
      setNewBlockedSource((prev) => ({ ...prev, [config.id]: '' }));
    } catch {
      setError('Failed to add blocked source');
    }
  };

  const handleRemoveBlockedSource = async (config: ResearchConfig, sourceToRemove: string) => {
    try {
      const updated = await configsApi.update(config.id, {
        blockedSources: (config.blockedSources || []).filter((s) => s !== sourceToRemove),
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch {
      setError('Failed to remove blocked source');
    }
  };

  const handleRunNow = async (configId: string) => {
    onClose();
    onResearchTriggered?.();
    try {
      await reportsApi.runConfig(configId);
    } catch (err) {
      console.error('Failed to start research:', err);
    }
  };

  const handleRunAll = async () => {
    const enabledConfigs = configs.filter((c) => c.enabled);
    if (enabledConfigs.length === 0) {
      setError('No enabled configurations to run');
      return;
    }

    onClose();
    onResearchTriggered?.();
    try {
      await reportsApi.runAll();
    } catch (err) {
      console.error('Failed to start research:', err);
    }
  };

  const scheduleOptions = [
    { value: '0 6 * * *', label: 'Daily at 6 AM' },
    { value: '0 8 * * *', label: 'Daily at 8 AM' },
    { value: '0 12 * * *', label: 'Daily at 12 PM' },
    { value: '0 18 * * *', label: 'Daily at 6 PM' },
    { value: '0 6 * * 1-5', label: 'Weekdays at 6 AM' },
    { value: '0 6 * * 1', label: 'Weekly on Monday' },
  ];

  const toggleSources = (configId: string) => {
    setExpandedSources((prev) => ({ ...prev, [configId]: !prev[configId] }));
  };

  const getSourceCount = (config: ResearchConfig) => {
    return (config.preferredSources?.length || 0) + (config.blockedSources?.length || 0);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: SYSTEM_FONT,
          fontWeight: 600,
          fontSize: '1.1rem',
          pb: 1,
        }}
      >
        Research Settings
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {configs.map((config, index) => {
          const category = config.category as CategoryType;
          const sourcesExpanded = expandedSources[config.id] || false;
          const sourceCount = getSourceCount(config);

          return (
            <Box key={config.id}>
              {index > 0 && <Divider sx={{ my: 3 }} />}

              {/* Header row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Switch
                    checked={config.enabled}
                    onChange={() => handleToggle(config)}
                    size="small"
                  />
                  <Typography
                    sx={{
                      fontFamily: SYSTEM_FONT,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: config.enabled ? 'text.primary' : 'text.disabled',
                    }}
                  >
                    {CATEGORY_LABELS[category] || config.name}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
                  onClick={() => handleRunNow(config.id)}
                  sx={{
                    fontFamily: SYSTEM_FONT,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Run now
                </Button>
              </Box>

              {/* Topics */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  sx={{
                    fontFamily: SYSTEM_FONT,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    mb: 1,
                  }}
                >
                  Topics
                </Typography>
                <ChipInput
                  value={newTopic[config.id] || ''}
                  onChange={(v) => setNewTopic((prev) => ({ ...prev, [config.id]: v }))}
                  onAdd={() => handleAddTopic(config)}
                  placeholder=""
                  chips={config.topics}
                  onRemove={(t) => handleRemoveTopic(config, t)}
                />
              </Box>

              {/* Schedule */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  sx={{
                    fontFamily: SYSTEM_FONT,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    mb: 1,
                  }}
                >
                  Schedule
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={config.schedule}
                    onChange={(e) => handleScheduleChange(config, e.target.value)}
                    sx={{ fontFamily: SYSTEM_FONT, fontSize: '0.875rem' }}
                  >
                    {scheduleOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontFamily: SYSTEM_FONT, fontSize: '0.875rem' }}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Source Preferences (collapsible) */}
              <Box>
                <Button
                  onClick={() => toggleSources(config.id)}
                  size="small"
                  sx={{
                    fontFamily: SYSTEM_FONT,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    p: 0,
                    minWidth: 0,
                    '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
                  }}
                  endIcon={sourcesExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                >
                  Source preferences {sourceCount > 0 && `(${sourceCount})`}
                </Button>

                <Collapse in={sourcesExpanded}>
                  <Box sx={{ mt: 2, pl: 0 }}>
                    {/* Preferred */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        sx={{
                          fontFamily: SYSTEM_FONT,
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          mb: 1,
                        }}
                      >
                        Prioritize these domains
                      </Typography>
                      <ChipInput
                        value={newPreferredSource[config.id] || ''}
                        onChange={(v) => setNewPreferredSource((prev) => ({ ...prev, [config.id]: v }))}
                        onAdd={() => handleAddPreferredSource(config)}
                        placeholder="arxiv.org, techcrunch.com..."
                        chips={config.preferredSources || []}
                        onRemove={(s) => handleRemovePreferredSource(config, s)}
                        variant="success"
                      />
                    </Box>

                    {/* Blocked */}
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: SYSTEM_FONT,
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          mb: 1,
                        }}
                      >
                        Exclude these domains
                      </Typography>
                      <ChipInput
                        value={newBlockedSource[config.id] || ''}
                        onChange={(v) => setNewBlockedSource((prev) => ({ ...prev, [config.id]: v }))}
                        onAdd={() => handleAddBlockedSource(config)}
                        placeholder="example.com..."
                        chips={config.blockedSources || []}
                        onRemove={(s) => handleRemoveBlockedSource(config, s)}
                        variant="error"
                      />
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            </Box>
          );
        })}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ fontFamily: SYSTEM_FONT, textTransform: 'none' }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleRunAll}
          startIcon={<PlayArrowIcon />}
          sx={{ fontFamily: SYSTEM_FONT, textTransform: 'none' }}
        >
          Run All
        </Button>
      </DialogActions>
    </Dialog>
  );
}
