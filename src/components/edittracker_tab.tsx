import { useEffect, useState } from "react";
import {
  Box,
  Select,
  Text,
  TextInput,
  Switch,
  Button
} from "@canva/app-ui-kit";
import {
  fetchEditSummaries,
  clearEditHistory,
  EditSummary
} from "../utils/my_api";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

const sortOptions = [
  { label: "🧑 Last Name (A–Z)", value: "lastName" },
  { label: "📄 Slide", value: "slide" },
  { label: "✏️ Edits", value: "numEdits" },
  { label: "⏱ Duration", value: "duration" },
  { label: "🕒 Timestamp (Newest)", value: "timestamp" }
];

const groupOptions = [
  { label: "None", value: "none" },
  { label: "By User", value: "user" },
  { label: "By Slide", value: "slide" }
];

type SortOption = "lastName" | "slide" | "numEdits" | "duration" | "timestamp";
type GroupOption = "none" | "user" | "slide";

export default function EditTrackerTab() {
  const [summaries, setSummaries] = useState<EditSummary[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("slide");
  const [sortAsc, setSortAsc] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [groupBy, setGroupBy] = useState<GroupOption>("none");
  const [confirmClear, setConfirmClear] = useState(false);
  const [showNonContributorsOnly, setShowNonContributorsOnly] = useState(false);
  const [contributionSummary, setContributionSummary] = useState<string | null>(null);
  const [studentFeedbackMap, setStudentFeedbackMap] = useState<Record<string, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  useEffect(() => {
    fetchEditSummaries().then(setSummaries);
  }, []);

  const handleTryExample = () => {
    const now = new Date();
    const minutesAgo = (min: number) =>
      new Date(now.getTime() - min * 60000).toISOString();
  
    setSummaries([
      // Alice Johnson – solid (5 edits, 2 slides, ~moderate duration)
      {
        user: "Alice Johnson",
        slide_id: "slide-1",
        edit_type: "text update",
        num_edits: 2,
        duration_sec: 500,
        timestamp: minutesAgo(40),
        avatar_url: "https://i.pravatar.cc/150?img=1"
      },
      {
        user: "Alice Johnson",
        slide_id: "slide-3",
        edit_type: "layout adjusted",
        num_edits: 3,
        duration_sec: 850,
        timestamp: minutesAgo(38),
        avatar_url: "https://i.pravatar.cc/150?img=1"
      },
  
      // Jayden Patel – high (8 edits, 3 slides, good duration)
      {
        user: "Jayden Patel",
        slide_id: "slide-2",
        edit_type: "animation added",
        num_edits: 4,
        duration_sec: 1100,
        timestamp: minutesAgo(36),
        avatar_url: "https://i.pravatar.cc/150?img=10"
      },
      {
        user: "Jayden Patel",
        slide_id: "slide-7",
        edit_type: "text update",
        num_edits: 2,
        duration_sec: 600,
        timestamp: minutesAgo(35),
        avatar_url: "https://i.pravatar.cc/150?img=10"
      },
      {
        user: "Jayden Patel",
        slide_id: "slide-4",
        edit_type: "image added",
        num_edits: 2,
        duration_sec: 800,
        timestamp: minutesAgo(34),
        avatar_url: "https://i.pravatar.cc/150?img=10"
      },
  
      // Haruki Sato – low (1 real edit, 1 idle)
      {
        user: "Haruki Sato",
        slide_id: "slide-5",
        edit_type: "image added",
        num_edits: 1,
        duration_sec: 300,
        timestamp: minutesAgo(33),
        avatar_url: "https://i.pravatar.cc/150?img=8"
      },
      {
        user: "Haruki Sato",
        slide_id: "slide-9",
        edit_type: "idle",
        num_edits: 0,
        duration_sec: 450,
        timestamp: minutesAgo(32),
        avatar_url: "https://i.pravatar.cc/150?img=8"
      },
  
      // Danielle Lee – moderate (5 edits, good time)
      {
        user: "Danielle Lee",
        slide_id: "slide-6",
        edit_type: "text update",
        num_edits: 4,
        duration_sec: 950,
        timestamp: minutesAgo(31),
        avatar_url: "https://i.pravatar.cc/150?img=4"
      },
      {
        user: "Danielle Lee",
        slide_id: "slide-10",
        edit_type: "layout adjusted",
        num_edits: 1,
        duration_sec: 350,
        timestamp: minutesAgo(30),
        avatar_url: "https://i.pravatar.cc/150?img=4"
      },
  
      // Liam Reyes – minimal (1 real edit)
      {
        user: "Liam Reyes",
        slide_id: "slide-8",
        edit_type: "text update",
        num_edits: 1,
        duration_sec: 250,
        timestamp: minutesAgo(29),
        avatar_url: "https://i.pravatar.cc/150?img=11"
      },
      {
        user: "Liam Reyes",
        slide_id: "slide-6",
        edit_type: "idle",
        num_edits: 0,
        duration_sec: 600,
        timestamp: minutesAgo(28),
        avatar_url: "https://i.pravatar.cc/150?img=11"
      },
  
      // Priya Mehta – none (only review)
      {
        user: "Priya Mehta",
        slide_id: "slide-3",
        edit_type: "review only",
        num_edits: 0,
        duration_sec: 400,
        timestamp: minutesAgo(27),
        avatar_url: "https://i.pravatar.cc/150?img=15"
      },
  
      // Grace O’Malley – solid (5 edits, good time)
      {
        user: "Grace O’Malley",
        slide_id: "slide-2",
        edit_type: "text update",
        num_edits: 2,
        duration_sec: 600,
        timestamp: minutesAgo(26),
        avatar_url: "https://i.pravatar.cc/150?img=7"
      },
      {
        user: "Grace O’Malley",
        slide_id: "slide-5",
        edit_type: "animation added",
        num_edits: 3,
        duration_sec: 800,
        timestamp: minutesAgo(25),
        avatar_url: "https://i.pravatar.cc/150?img=7"
      }
    ]);
  };
  
  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearEditHistory();
    setSummaries([]);
    setContributionSummary(null); // 🧹 clear the summary
    setStudentFeedbackMap({}); // 🧹 clear the feedback map
    setConfirmClear(false);
    alert("✅ Edit history cleared.");
  };

  const handleSummarize = () => {
    const contributors: Record<string, number> = {};
    const allUsers = new Set<string>();
    const nonContributors = new Set<string>();
    const slideStats: Record<string, { totalEdits: number; users: Set<string> }> = {};
    const meaningfulEdits: Record<string, { totalEdits: number; duration: number; slides: Set<string> }> = {};
    let totalMeaningfulEdits = 0;

    summaries.forEach((s) => {
      allUsers.add(s.user);
      const isMeaningful = s.num_edits > 0 && !["idle", "review only"].includes(s.edit_type);
      if (isMeaningful) {
        contributors[s.user] = (contributors[s.user] || 0) + s.num_edits;
      } else {
        if (!(s.user in contributors)) nonContributors.add(s.user);
      }

      if (!slideStats[s.slide_id]) {
        slideStats[s.slide_id] = { totalEdits: 0, users: new Set() };
      }
      if (isMeaningful) {
        slideStats[s.slide_id].totalEdits += s.num_edits;
        slideStats[s.slide_id].users.add(s.user);
      }

      if (isMeaningful) {
        if (!meaningfulEdits[s.user]) {
          meaningfulEdits[s.user] = { totalEdits: 0, duration: 0, slides: new Set() };
        }
        meaningfulEdits[s.user].totalEdits += s.num_edits;
        meaningfulEdits[s.user].duration += s.duration_sec;
        meaningfulEdits[s.user].slides.add(s.slide_id);
        totalMeaningfulEdits += s.num_edits;
      }
    });

    const totalUsers = Object.keys(contributors).length;
    const totalEdits = Object.values(contributors).reduce((a, b) => a + b, 0);
    const averageEdits = totalUsers > 0 ? (totalEdits / totalUsers).toFixed(1) : "0";

    const sortByLastName = (a: string, b: string) =>
      a.split(" ").slice(-1)[0].localeCompare(b.split(" ").slice(-1)[0]);

    const perSlide = Object.entries(slideStats)
      .map(([slide, stats]) => {
        const line = `• ${slide}: ${stats.totalEdits} edits by ${stats.users.size} user(s)`;
        return stats.totalEdits === 0 ? `🚫 ${line}` : line;
      })
      .join("\n");

    const feedbackMap: Record<string, string> = {};

    const allStudentNames = Array.from(new Set(summaries.map(s => s.user)));

allStudentNames.forEach((user) => {
  const stats = meaningfulEdits[user] || { totalEdits: 0, duration: 0, slides: new Set<string>() };
  const share = stats.totalEdits / totalMeaningfulEdits || 0;
  const avgTime = stats.totalEdits > 0 ? stats.duration / stats.totalEdits : 0;
  const slideCount = stats.slides.size;

  const totalStudents = allStudentNames.length;
  const expectedShare = 1 / totalStudents;
  const highCutoff = expectedShare * 1.2;
  const solidCutoff = expectedShare * 0.9;
  const moderateCutoff = expectedShare * 0.5;
  const minimalCutoff = expectedShare * 0.2;

  const contributionLevel =
    share >= highCutoff ? "high"
    : share >= solidCutoff ? "solid"
    : share >= moderateCutoff ? "moderate"
    : share >= minimalCutoff ? "minimal"
    : "none";

  let icon = "🟢";
  let summary = "";
  let tip = "";

  const sharePercent = (share * 100).toFixed(1);
  const expectedPercent = (expectedShare * 100).toFixed(1);
  const slideLabel = slideCount === 1 ? "slide" : "slides";

  if (contributionLevel === "high") {
    icon = "🟢";
    summary = `Fantastic! You contributed a strong share of the total edits (well above average), with thoughtful work across multiple slides.`;
    tip = `📈 Tip: You're modeling excellent teamwork. Keep helping elevate the overall quality.`;
  } else if (contributionLevel === "solid") {
    icon = "🟢";
    summary = `Great effort! You’re contributing slightly above average — your edits show good quality and time investment.`;
    tip = `📌 Tip: To reach the top, try leading edits on a few more slides or refining visual/layout details.`;
  } else if (contributionLevel === "moderate") {
    icon = "🟡";
    summary = `Good start — your edits account for a moderate share of the team's total. You've made a few solid improvements.`;
    tip = `📘 Tip: Try branching out to more slides or deepening the quality of each change.`;
  } else if (contributionLevel === "minimal") {
    icon = "🟡";
    summary = `You're contributing, but still well below the expected level.`;
    tip = `🔍 Tip: Start with small but clear edits — fix headers, reword unclear sections, or help with layout. A few more actions can boost your score.`;
  } else {
    icon = "🔴";
    summary = `It looks like you haven’t made any meaningful edits yet.`;
    tip = `🧭 Tip: Begin by adding or improving just 1–2 slides — every contribution counts and helps the team.`;
  }

  feedbackMap[user] =
    `${icon} ${user}\n` +
    `• You contributed ${stats.totalEdits} meaningful edit(s) on ${slideCount} ${slideLabel} ` +
    `(avg ${Math.floor(avgTime / 60)}m ${Math.round(avgTime % 60)}s/edit, ${sharePercent}% of total edits).\n\n` +
    `• ${summary}\n\n• ${tip}\n • (Expected share for a ${totalStudents}-person team: ~${expectedPercent}%)`;
});

const extractIcon = (text: string | undefined): string => {
    if (!text) return "🟡"; // default fallback
    if (text.includes("🟢")) return "🟢";
    if (text.includes("🟡")) return "🟡";
    if (text.includes("🔴")) return "🔴";
    return "🟡";
  };
  
  const meaningfulUsers = new Set(Object.keys(meaningfulEdits));
const allSortedUsers = Array.from(allUsers).sort(sortByLastName);

const contributorsList = allSortedUsers
  .filter((user) => meaningfulUsers.has(user))
  .map((user) => `${extractIcon(feedbackMap[user])} ${user}`)
  .join("\n");

const nonContributorsList = allSortedUsers
  .filter((user) => !meaningfulUsers.has(user))
  .map((user) => `${extractIcon(feedbackMap[user])} ${user}`)
  .join("\n");
  
  const totalStudents = allUsers.size;
    const now = new Date();
    const lastUpdated = now.toLocaleString();

    const summary =
      `📊 Overview\n` +
      `• Unique Contributors: ${totalUsers}/${totalStudents}\n` +
      `• Total Edits: ${totalEdits}\n` +
      `• Avg. Edits/User: ${averageEdits}\n\n` +
      `🙌 Contributed\n` +
      `${contributorsList || "• No contributors found."}\n\n` +
      `📝 Needs to Participate\n` +
      `${nonContributorsList || "• No non-contributors found."}\n\n` +
      `📄 Slide Activity:\n` +
      `${perSlide || "• No slide edits found."}\n\n`; +
      `🕓 Last Updated: ${lastUpdated}`;

    setContributionSummary(summary);
    setStudentFeedbackMap(feedbackMap);
    const defaultStudent = Object.keys(feedbackMap)[0] || "";
    setSelectedStudent(defaultStudent);
  };

  
  // 💡 Smart Non-Contributor Detection
  const contributorMap: Record<string, boolean> = {};
  summaries.forEach((s) => {
    if (s.num_edits > 0 && !["idle", "review only"].includes(s.edit_type)) {
      contributorMap[s.user] = true;
    } else if (!(s.user in contributorMap)) {
      contributorMap[s.user] = false;
    }
  });

  const filtered = summaries
    .filter((s) =>
      `${s.user} ${s.slide_id}`.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((s) => {
      if (!showNonContributorsOnly) return true;
      return !contributorMap[s.user];
    });

  const sorted = [...filtered].sort((a, b) => {
    let result = 0;
    switch (sortBy) {
      case "lastName":
        result = a.user.split(" ").slice(-1)[0].localeCompare(b.user.split(" ").slice(-1)[0]);
        break;
      case "slide":
        result = a.slide_id.localeCompare(b.slide_id);
        break;
      case "numEdits":
        result = a.num_edits - b.num_edits;
        break;
      case "duration":
        result = a.duration_sec - b.duration_sec;
        break;
      case "timestamp":
        result = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
    }
    return sortAsc ? result : -result;
  });

  const grouped: Record<string, EditSummary[]> =
    groupBy === "none"
      ? { All: sorted }
      : sorted.reduce((acc, item) => {
          const key = groupBy === "user" ? item.user : item.slide_id;
          acc[key] = acc[key] || [];
          acc[key].push(item);
          return acc;
        }, {} as Record<string, EditSummary[]>);

  return (
    <Box padding="2u" display="flex" flexDirection="column">
      <Text variant="bold" size="large">📊 Edit Tracker Summary</Text>
        <Text size="medium" tone="secondary">
        Bring visibility to collaboration. Track who edited what, when, and how much with real-time summaries, contribution labels, and personalized feedback. Perfect for teams and classrooms.

</Text>

      <Box paddingTop="3uu" display="flex" flexDirection="column" gap="3u">
        <Box paddingTop="2u">
          <Button variant="secondary" onClick={handleTryExample}>✨ Try an Example</Button>
        </Box>

        <Box paddingTop="1u" paddingBottom="2u">
  <Button variant="primary" onClick={handleSummarize}>📋 Summarize Contributions</Button>
</Box>

      {contributionSummary && (
  <Box
    marginTop="3u"
    background="white"
    border="standard"
    borderRadius="large"
    padding="1.5u"
  >
    <Text variant="bold" size="large" paddingBottom="1u">
      📋 Contribution Summary
    </Text>
    <Box
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
        fontSize: "16px",
        lineHeight: "1.6"
      }}
    >

      {contributionSummary.split("\n").map((line, idx) => {
        const isHeader = [
          "📊 Overview",
          "🙌 Contributed",
          "📝 Needs to Participate",
          "📄 Slide Activity",
          "🕓 Last Updated"
        ].some((h) => line.includes(h));

        if (line.trim() === "") {
          return <Box key={idx} height="full" />;
        }

        return (
          <Text key={idx} size="medium" variant={isHeader ? "bold" : "regular"}>
            {line}
          </Text>
        );
      })}
    </Box>
  </Box>
)}

{Object.keys(studentFeedbackMap).length > 0 && (
  <Box paddingTop="3u">
    <Text variant="bold" size="large">🎓 Individual Feedback</Text>

    <Box marginTop="1u">
      <Select
        label="Choose a student"
        value={selectedStudent}
        onChange={(val) => setSelectedStudent(val)}
        options={Object.keys(studentFeedbackMap).map((user) => ({
          label: user,
          value: user
        }))}
      />
    </Box>

    <Box
      marginTop="1.5u"
      border="standard"
      borderRadius="large"
      padding="1.5u"
    >
      <Text size="medium">
        {studentFeedbackMap[selectedStudent].split("\n").map((line, idx) => (
          <Box key={idx} marginBottom="0.75u">
            <Text size="medium">{line}</Text>
          </Box>
        ))}
      </Text>
    </Box>
  </Box>
)}

<Box paddingTop="2u">
          <Text variant="bold" size="large">🔧 Filter Controls</Text>
        </Box>

        <Box paddingTop="1u">
          <Text variant="bold" size="medium">🔍 Search</Text>
          <TextInput
            label="Search by user or slide"
            value={searchText}
            onChange={setSearchText}
            placeholder="e.g. Alice or slide-3"
          />
        </Box>

        <Box paddingTop="2u">
          <Text variant="bold" size="medium" paddingBottom="0.5u">🧩 Sort Options</Text>
          <Box display="flex" gap="2.5u" alignItems="center" flexWrap="wrap">
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
              options={sortOptions}
            />
            <Box display="flex" alignItems="center" gap="1.5u" paddingX="2u">
              <Switch
                checked={sortAsc}
                onChange={setSortAsc}
                aria-label="Toggle ascending/descending"
              />
              <Box paddingX="1u">
                <Text size="small">{sortAsc ? "⬆️ Asc." : "⬇️ Desc."}</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box paddingTop="2u">
          <Text variant="bold" size="medium">🗂️ Group Results</Text>
          <Select
            label="Group By"
            value={groupBy}
            onChange={(val) => setGroupBy(val as GroupOption)}
            options={groupOptions}
          />
        </Box>
      </Box>

      <Box paddingTop="1u" paddingBottom="2u">
        <Box display="flex" alignItems="center" gap="1u">
          <Switch
            checked={showNonContributorsOnly}
            onChange={setShowNonContributorsOnly}
            aria-label="Toggle non-contributors only"
          />
          <Box paddingX="1u">
            <Text size="small">🙈 Show only non-contributors</Text>
          </Box>
        </Box>
      </Box>

      <Box paddingTop="3u" display="flex" flexDirection="column" gap="2u">
        {Object.entries(grouped).map(([group, entries]) => (
          <Box key={group} display="block" gap="1.5u">
            {groupBy !== "none" && (
              <Text variant="bold" size="medium" paddingBottom="1u">📂 {group}</Text>
            )}
            {entries.map((summary, idx) => (
              <Box
                key={idx}
                border="standard"
                borderRadius="large"
                background="neutralLow"
                padding="1.5u"
                display="block"
                gap="0.5u"
                marginBottom="1u"
              >
                <Text variant="bold">👤 {summary.user}</Text>
                <Text size="small">📄 Slide: {summary.slide_id}</Text>
                <Text size="small">✏️ Edits: {summary.num_edits}</Text>
                <Text size="small">🔧 Type: {summary.edit_type}</Text>
                <Text size="small">⏱ Duration: {formatDuration(summary.duration_sec)}</Text>
                <Text size="small">🕒 Last Log: {formatTime(summary.timestamp)}</Text>
              </Box>
            ))}
          </Box>
        ))}

        <Box paddingTop="3u">
          <Button
            variant="secondary"
            tone="critical"
            onClick={handleClear}
          >
            {confirmClear ? "❗ Are You Sure?" : "🗑 Refresh History"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
