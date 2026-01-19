// Transform backend data to UI format

// Status mapping: backend -> UI
const STATUS_MAP = {
  'to_do': { label: 'Not Started', color: '#C4C4C4' },
  'in_progress': { label: 'Working on it', color: '#FDAB3D' },
  'done': { label: 'Done', color: '#00C875' },
  'stuck': { label: 'Stuck', color: '#E44258' }
};

// Priority mapping: backend -> UI
const PRIORITY_MAP = {
  'low': { label: 'Low', color: '#579BFC' },
  'medium': { label: 'Medium', color: '#FDAB3D' },
  'high': { label: 'High', color: '#E44258' },
  'urgent': { label: 'Critical', color: '#E44258' }
};

// Reverse mapping for sending to backend
export const UI_STATUS_TO_BACKEND = {
  'Not Started': 'to_do',
  'Working on it': 'in_progress',
  'Done': 'done',
  'Stuck': 'stuck'
};

export const UI_PRIORITY_TO_BACKEND = {
  'Low': 'low',
  'Medium': 'medium',
  'High': 'high',
  'Critical': 'urgent'
};

// Generate avatar and color from name
const getAvatarAndColor = (name) => {
  const names = name.split(' ');
  const avatar = names.length >= 2 
    ? `${names[0][0]}${names[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
  
  // Simple color generation based on name hash
  const colors = ['#9D99E5', '#579BFC', '#FF7575', '#037F4C', '#FDAB3D', '#FF6B6B', '#00C875'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  
  return { avatar, color };
};

// Transform backend sub-item to UI format
export const transformSubItem = (backendSubItem) => {
  return {
    id: backendSubItem.id.toString(),
    title: backendSubItem.title || '',
    description: backendSubItem.description || '',
    status: STATUS_MAP[backendSubItem.status] || STATUS_MAP['to_do'],
    priority: PRIORITY_MAP[backendSubItem.priority] || PRIORITY_MAP['medium'],
    timeline: {
      start: backendSubItem.timeline_start || new Date().toISOString().split('T')[0],
      end: backendSubItem.timeline_end || new Date().toISOString().split('T')[0]
    },
    parent_item_id: backendSubItem.parent_item_id
  };
};

// Transform backend item to UI format
export const transformItem = (backendItem) => {
  const transformed = {
    id: backendItem.id.toString(),
    name: backendItem.title || backendItem.name || '',
    status: STATUS_MAP[backendItem.status] || STATUS_MAP['to_do'],
    person: backendItem.assignee_names && backendItem.assignee_names.length > 0
      ? {
          name: backendItem.assignee_names[0],
          ...getAvatarAndColor(backendItem.assignee_names[0])
        }
      : { name: 'Unassigned', avatar: 'UA', color: '#C4C4C4' },
    date: backendItem.timeline_start || backendItem.date || new Date().toISOString().split('T')[0],
    priority: PRIORITY_MAP[backendItem.priority] || PRIORITY_MAP['medium'],
    timeline: {
      start: backendItem.timeline_start || new Date().toISOString().split('T')[0],
      end: backendItem.timeline_end || new Date().toISOString().split('T')[0]
    }
  };

  // Include sub-items if they exist - ensure it's always an array
  transformed.sub_items = (backendItem.sub_items && Array.isArray(backendItem.sub_items))
    ? backendItem.sub_items.map(transformSubItem)
    : [];

  return transformed;
};

// Transform backend group to UI format
export const transformGroup = (backendGroup, items = []) => {
  return {
    id: backendGroup.id.toString(),
    name: backendGroup.name,
    color: backendGroup.color || '#0073EA',
    items: items.map(transformItem)
  };
};

// Transform backend board to UI format
export const transformBoard = (backendBoard) => {
  const groups = (backendBoard.groups || []).map(group => {
    // If groups already have items, use them; otherwise items will be fetched separately
    const items = group.items || [];
    return transformGroup(group, items);
  });

  return {
    id: backendBoard.id.toString(),
    name: backendBoard.name,
    color: backendBoard.color || '#FF6B6B',
    groups: groups
  };
};

// Prepare item data for backend
export const prepareItemForBackend = (uiItem, groupId, boardId) => {
  return {
    title: uiItem.name,
    description: uiItem.description || '',
    group_id: parseInt(groupId),
    board_id: parseInt(boardId),
    status: UI_STATUS_TO_BACKEND[uiItem.status.label] || 'to_do',
    priority: UI_PRIORITY_TO_BACKEND[uiItem.priority.label] || 'medium',
    timeline_start: uiItem.timeline.start,
    timeline_end: uiItem.timeline.end,
    // assignee_ids will be handled separately
  };
};

// Export status and priority options for UI
export const statusOptions = [
  ...Object.values(STATUS_MAP),
  { label: 'Review', color: '#579BFC' } // Additional UI option
];
export const priorityOptions = Object.values(PRIORITY_MAP);

