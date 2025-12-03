// admin-ui/src/pages/RoomOverview/index.jsx

import React from "react";
import RoomOverviewPage from "../Dashboard/RoomOverview";

/**
 * This component is the existing route target for /admin/room-overview.
 * We keep the route and simply delegate to the new Dashboard Room Overview
 * implementation, so we don't disturb any existing routing or navigation.
 */
export default function RoomOverview() {
  return <RoomOverviewPage />;
}
