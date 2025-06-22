import { useState } from "react";
import { Box, Button, Text } from "@canva/app-ui-kit";
import SpeakerNotesTab from "../components/speakernotes_tab";
import BeatSyncTab from "../components/beatsync_tab";
import VisualPromptTab from "src/components/visualprompt_tab";
import EditTrackerTab from "../components/edittracker_tab"; // ✅ Import

export const GeneratePage = () => {
  const [activeTab, setActiveTab] = useState<
    "notes" | "beatsync" | "visual" | "edittracker"
  >("notes");

  return (
    <Box padding="1u" display="flex" flexDirection="column" gap="2.5u">
      <Box
        background="neutralLow"
        padding="1u"
        borderRadius="large"
        border="standard"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text variant="bold" size="large">
          🧠 Choose a Tool to Start
        </Text>
      </Box>

      {/* Tab Navigation Buttons */}
      <Box display="flex" flexDirection="column" gap="1u" width="100%">
        <Button
          variant={activeTab === "notes" ? "primary" : "tertiary"}
          onClick={() => setActiveTab("notes")}
          fullWidth
        >
          🎙 Generate Speaker Notes
        </Button>
        <Button
          variant={activeTab === "beatsync" ? "primary" : "tertiary"}
          onClick={() => setActiveTab("beatsync")}
          fullWidth
        >
          🎵 Beat Sync to Music
        </Button>
        <Button
          variant={activeTab === "visual" ? "primary" : "tertiary"}
          onClick={() => setActiveTab("visual")}
          fullWidth
        >
          🎨 Visual Prompt Suggestion
        </Button>
        <Button
          variant={activeTab === "edittracker" ? "primary" : "tertiary"}
          onClick={() => setActiveTab("edittracker")}
          fullWidth
        >
          📊 Edit Tracker
        </Button>
      </Box>

      {/* Tab Content */}
      <Box paddingTop="2u">
        {activeTab === "notes" && <SpeakerNotesTab />}
        {activeTab === "beatsync" && <BeatSyncTab />}
        {activeTab === "visual" && <VisualPromptTab />}
        {activeTab === "edittracker" && <EditTrackerTab />}
      </Box>
    </Box>
  );
};
