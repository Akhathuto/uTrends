# Changelog

All notable changes to the **uTrend - AI Content Suite** application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.3.0] - 2024-07-29

### Added
-   **Autonomous Agent Mode:** The Nolo AI tool was upgraded with an "Agent Mode" that uses Gemini's Function Calling. The agent can now understand complex, multi-step commands and autonomously execute other application tools (like Script Writer, Thumbnail Ideas) to complete tasks.
-   **Real-time Task Log:** A new UI component was added to Agent Mode to provide users with a transparent, step-by-step view of the agent's thought process and actions.
-   **Voice Input & Utility Buttons:** Added UI placeholders for voice input, file upload, and a functional "Copy Conversation" button to the Nolo AI chat interface.

## [1.2.0] - 2024-07-28

### Added
-   **Live Voice Chat in Avatar Studio:** Integrated the Gemini Live API to enable real-time, two-way voice conversations with AI avatars, including live transcription.
-   **"My Content" Library:** Activated the "My Content" section, allowing users to save, view, and delete generated assets (scripts, growth plans, thumbnail ideas) using the browser's local storage for persistence.
-   **Interactive Trend Ideas:** The "Realtime Trends" on the dashboard now include a "Get Content Ideas" button, which uses AI to generate relevant video ideas based on a specific trend.
-   **Content Calendar:** A new tool to generate a 7-day content plan with ideas, formats, and platforms for a given topic.

### Changed
-   **Upgraded Script Writer UI:** The output of the Script Writer is now parsed and displayed in distinct, well-formatted cards for better readability.

## [1.1.0] - 2024-07-27

### Added
-   **Main Dashboard:** Replaced the static welcome screen with a dynamic dashboard, serving as the new command center.
-   **Realtime Trends Component:** Added a section to the dashboard that fetches and displays the latest trending content from creators on major platforms, with direct links to view the content.
-   **New Tools:** Introduced the `Monetization Guide` and `Thumbnail Ideas` tools.

### Changed
-   **Sidebar Redesign:** The sidebar navigation was restructured into more granular, collapsible groups for a more intuitive user experience.
-   **Branding Update:** Renamed the app to "Creator AI" in the UI for a more direct and user-friendly name.

## [1.0.0] - 2024-07-26

### Added
-   **Initial Release of uTrend:** First version of the application developed by Edgtec.
-   **Core Suites:** Organized into three main suites: "Discovery & Analytics," "AI Create," and "Strategy & Growth."
-   **Foundation Tools:** Included initial versions of `Script Writer`, `Media Generator`, `Growth Planner`, `Content Analyzer`, `Trends & Keywords`, and more.
-   **Basic AI Chat:** An initial version of the Nolo AI chat assistant.
