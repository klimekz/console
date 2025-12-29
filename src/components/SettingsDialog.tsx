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
  FormControlLabel,
  Chip,
  IconButton,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { ResearchConfig, CategoryType } from '../types';
import { CATEGORY_LABELS } from '../types';
import { configsApi, reportsApi } from '../api/client';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onResearchTriggered?: () => void;
}

export function SettingsDialog({ open, onClose, onResearchTriggered }: SettingsDialogProps) {
  const [configs, setConfigs] = useState<ResearchConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState<Record<string, string>>({});
  const [newPreferredSource, setNewPreferredSource] = useState<Record<string, string>>({});
  const [newBlockedSource, setNewBlockedSource] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadConfigs();
    }
  }, [open]);

  const loadConfigs = async () => {
    try {
      const data = await configsApi.getAll();
      setConfigs(data);
    } catch (err) {
      setError('Failed to load configurations');
    }
  };

  const handleToggle = async (config: ResearchConfig) => {
    try {
      const updated = await configsApi.update(config.id, { enabled: !config.enabled });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch (err) {
      setError('Failed to update configuration');
    }
  };

  const handleScheduleChange = async (config: ResearchConfig, schedule: string) => {
    try {
      const updated = await configsApi.update(config.id, { schedule });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch (err) {
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
    } catch (err) {
      setError('Failed to add topic');
    }
  };

  const handleRemoveTopic = async (config: ResearchConfig, topicToRemove: string) => {
    try {
      const updated = await configsApi.update(config.id, {
        topics: config.topics.filter((t) => t !== topicToRemove),
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch (err) {
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
    } catch (err) {
      setError('Failed to add preferred source');
    }
  };

  const handleRemovePreferredSource = async (config: ResearchConfig, sourceToRemove: string) => {
    try {
      const updated = await configsApi.update(config.id, {
        preferredSources: (config.preferredSources || []).filter((s) => s !== sourceToRemove),
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch (err) {
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
    } catch (err) {
      setError('Failed to add blocked source');
    }
  };

  const handleRemoveBlockedSource = async (config: ResearchConfig, sourceToRemove: string) => {
    try {
      const updated = await configsApi.update(config.id, {
        blockedSources: (config.blockedSources || []).filter((s) => s !== sourceToRemove),
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? updated : c)));
    } catch (err) {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Playfair Display", serif' }}>
        Research Configuration
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Configure your research topics and schedules. Each category will produce a daily report
          with up to 15 items.
        </Typography>

        {configs.map((config) => {
          const category = config.category as CategoryType;
          return (
            <Accordion key={config.id} defaultExpanded={config.enabled}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.enabled}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggle(config);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                  <Typography sx={{ fontWeight: 600 }}>
                    {CATEGORY_LABELS[category] || config.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                    {config.topics.length} topics
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {config.description}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Topics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {config.topics.map((topic) => (
                      <Chip
                        key={topic}
                        label={topic}
                        onDelete={() => handleRemoveTopic(config, topic)}
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add a topic..."
                      value={newTopic[config.id] || ''}
                      onChange={(e) =>
                        setNewTopic((prev) => ({ ...prev, [config.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTopic(config);
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      onClick={() => handleAddTopic(config)}
                      disabled={!newTopic[config.id]?.trim()}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Preferred Sources */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.main' }}>
                    Preferred Sources
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
                    Domains to prioritize (e.g., arxiv.org, techcrunch.com)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {(config.preferredSources || []).map((source) => (
                      <Chip
                        key={source}
                        label={source}
                        onDelete={() => handleRemovePreferredSource(config, source)}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ))}
                    {(!config.preferredSources || config.preferredSources.length === 0) && (
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                        No preferred sources set
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add domain (e.g., arxiv.org)..."
                      value={newPreferredSource[config.id] || ''}
                      onChange={(e) =>
                        setNewPreferredSource((prev) => ({ ...prev, [config.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPreferredSource(config);
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      onClick={() => handleAddPreferredSource(config)}
                      disabled={!newPreferredSource[config.id]?.trim()}
                      color="success"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Blocked Sources */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.main' }}>
                    Blocked Sources
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
                    Domains to exclude from results
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {(config.blockedSources || []).map((source) => (
                      <Chip
                        key={source}
                        label={source}
                        onDelete={() => handleRemoveBlockedSource(config, source)}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    ))}
                    {(!config.blockedSources || config.blockedSources.length === 0) && (
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                        No blocked sources
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add domain to block..."
                      value={newBlockedSource[config.id] || ''}
                      onChange={(e) =>
                        setNewBlockedSource((prev) => ({ ...prev, [config.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBlockedSource(config);
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      onClick={() => handleAddBlockedSource(config)}
                      disabled={!newBlockedSource[config.id]?.trim()}
                      color="error"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Schedule</InputLabel>
                    <Select
                      value={config.schedule}
                      label="Schedule"
                      onChange={(e) => handleScheduleChange(config, e.target.value)}
                    >
                      {scheduleOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleRunNow(config.id)}
                  >
                    Run Now
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleRunAll}
          startIcon={<PlayArrowIcon />}
        >
          Run All Research
        </Button>
      </DialogActions>
    </Dialog>
  );
}
