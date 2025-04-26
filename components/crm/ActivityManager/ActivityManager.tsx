import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography, Button, useTheme } from "@mui/material";
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  List as ListIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { activityStore } from "../../../stores/activityStore";
import { Activity, CalendarViewState, ActivityFilters } from "./types";
import ActivityCalendar from "./ActivityCalendar";
import ActivityList from "./ActivityList";
import ActivityFiltersPanel from "./ActivityFiltersPanel";
import ActivityDialog from "./ActivityDialog";

interface ActivityManagerProps {
  clientId?: string;
  opportuniteId?: string;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({
  clientId,
  opportuniteId,
}) => {
  const theme = useTheme();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [calendarState, setCalendarState] = useState<CalendarViewState>({
    vue: "semaine",
    date: new Date(),
  });
  const [filters, setFilters] = useState<ActivityFilters>({
    client: clientId,
    opportunite: opportuniteId,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);

  useEffect(() => {
    // Charger les activités depuis le store
    const loadedActivities = activityStore.getActivities(filters);
    setActivities(loadedActivities);
  }, [filters]);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: "calendar" | "list"
  ) => {
    setView(newValue);
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedActivity(null);
  };

  const handleActivitySave = (activity: Activity) => {
    if (activity.id) {
      activityStore.updateActivity(activity);
    } else {
      activityStore.addActivity(activity);
    }

    // Rafraîchir la liste des activités
    const updatedActivities = activityStore.getActivities(filters);
    setActivities(updatedActivities);
    setIsDialogOpen(false);
  };

  const handleFilterChange = (newFilters: ActivityFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleCalendarViewChange = (newView: CalendarViewState) => {
    setCalendarState(newView);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          Gestion des Activités
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
            sx={{ mr: 1 }}
          >
            Filtres
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddActivity}
          >
            Nouvelle Activité
          </Button>
        </Box>
      </Box>

      {isFiltersPanelOpen && (
        <ActivityFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setIsFiltersPanelOpen(false)}
        />
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={view} onChange={handleTabChange}>
          <Tab icon={<CalendarIcon />} label="Calendrier" value="calendar" />
          <Tab icon={<ListIcon />} label="Liste" value="list" />
        </Tabs>
      </Box>

      {view === "calendar" && (
        <ActivityCalendar
          activities={activities}
          calendarState={calendarState}
          onActivityClick={handleActivityClick}
          onViewChange={handleCalendarViewChange}
        />
      )}

      {view === "list" && (
        <ActivityList
          activities={activities}
          onActivityClick={handleActivityClick}
        />
      )}

      <ActivityDialog
        open={isDialogOpen}
        activity={selectedActivity}
        onClose={handleDialogClose}
        onSave={handleActivitySave}
        clientId={clientId}
        opportuniteId={opportuniteId}
      />
    </Box>
  );
};

export default ActivityManager;
