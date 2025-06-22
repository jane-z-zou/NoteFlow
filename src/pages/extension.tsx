import { Box, Text } from "@canva/app-ui-kit";
import EditTrackerTab from "../components/edittracker_tab";

export const ExtensionToolsPage = () => {
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
          🧩 EditGuru
        </Text>
      </Box>

      {/* Main Content */}
      <Box paddingTop="2u">
        <EditTrackerTab />
      </Box>
    </Box>
  );
};

export default ExtensionToolsPage;
