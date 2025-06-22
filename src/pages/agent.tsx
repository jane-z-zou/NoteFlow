import { Box, Text } from "@canva/app-ui-kit";
import SpeakerNotesTab from "../components/speakernotes_tab";
import { Agent } from "http";

export const AgentToolsPage = () => {
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
        🎤🌊 NoteFlow
        </Text>
      </Box>

      {/* Main Content */}
      <Box paddingTop="2u">
        <SpeakerNotesTab />
      </Box>
    </Box>
  );
};

export default AgentToolsPage;
