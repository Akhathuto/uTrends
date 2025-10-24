# uTrend - AI Content Suite Documentation

## 1. Introduction

Welcome to the official documentation for **uTrend**, an all-in-one AI-powered platform for content creators. This application is designed, developed, and owned by **Edgtec**.

uTrend leverages the power of Google's advanced Gemini AI models to provide a seamless, end-to-end solution for the entire content creation lifecycle. Our goal is to empower creators by automating tedious tasks, sparking creativity, and providing data-driven strategic insights.

## 2. Core Feature Suites

The application is organized into three powerful suites, accessible from the main sidebar.

### 2.1. Discovery & Analytics

This suite focuses on research, analysis, and staying ahead of the curve.

-   **Trends & Keywords:** A dual-function tool for discovering real-time trending topics on platforms like YouTube and TikTok (powered by Google Search) and conducting in-depth SEO research on any keyword.
-   **Content Analyzer:** Analyze competitor channels to understand their strategy or upload your own video to get a frame-by-frame AI analysis and suggestions for improvement.

### 2.2. AI Create Suite

Your central hub for generating all types of content and media.

-   **Media Generator:** A versatile tool for creating visual assets from text prompts, including images, logos, standard videos, animations, and GIFs.
-   **Image Editor:** Upload an image and use simple text commands to make modifications (e.g., "add a retro filter").
-   **Video Editor:** Create videos scene-by-scene. Start with an initial prompt and then extend the video by describing what happens next.
-   **Avatar Studio:** A powerful suite to design, save, and interact with AI avatars. Create a character's appearance from text, then bring it to life by generating lip-synced video animations with custom dialogue and gestures, or engage in a live voice conversation.
-   **Script Writer:** Go from a simple topic to a complete, well-structured video script. The AI generates a catchy title, hook, introduction, main points, conclusion, and call to action, presented in easy-to-read cards.
-   **Thumbnail Ideas:** Generate three distinct, visually descriptive, click-worthy thumbnail concepts for any video title.
-   **Engagement Tools:** Includes a **Comment Responder** to help you generate on-brand replies to your audience and a **Prompt Generator** to craft better, more detailed prompts for AI tools.

### 2.3. Strategy & Growth Engine

Tools focused on long-term planning, monetization, and maximizing your content's reach.

-   **Growth Planner:** Get a custom, multi-point growth plan for your channel, including content strategy, engagement tactics, and collaboration ideas.
-   **Monetization Guide:** Receive tailored monetization strategies based on your platform and audience size.
-   **Repurpose Content:** Turn a single script or piece of text into a blog post, a Tweet thread, and a LinkedIn post automatically.
-   **Content Calendar:** Plan your content schedule for the week ahead with AI-generated ideas tailored to your niche.

## 3. Nolo AI: Your Autonomous Assistant

Nolo AI is the central intelligence of the uTrend platform, accessible from the main sidebar. It operates in two modes:

-   **Chat Mode:** A conversational AI assistant for brainstorming, asking questions, and getting quick advice.
-   **Agent Mode:** This is where the true power of uTrend is unlocked. You can give the agent a high-level, multi-step command (e.g., "Write a script about the Roman Empire, then generate three thumbnail ideas for it"). The agent uses **Gemini's Function Calling** capability to autonomously control and execute the application's other tools (`Script Writer`, `Thumbnail Ideas`, etc.) to fulfill your request. The **Task Log** provides a transparent, real-time view of the agent's thought process and actions.

## 4. Library

-   **My Content:** A personal library where you can save the assets you generate across the platform, such as scripts, growth plans, and thumbnail ideas. All data is persisted in your browser's local storage for easy access.

## 5. Development and Reverting Changes

### 5.1. AI-Assisted Development

The uTrend platform is developed and maintained through an interactive process with a senior AI frontend engineer. All changes, from minor bug fixes to major feature releases, are implemented based on direct user requests.

### 5.2. Versioning

All significant updates are tracked in the `docs/CHANGELOG.md` file, following semantic versioning (e.g., `1.3.0`). This provides a clear history of what was changed and when.

### 5.3. How to Revert to a Previous Version

Because this is a conversational development process, there is no traditional Git repository to roll back. However, the AI maintains a history of the file states within our conversation.

If an update introduces a bug, breaks functionality, or is otherwise undesirable, you can easily request a revert. To do so, please use a clear and direct prompt.

**Example Revert Command:**

> "There was an issue with the latest update. Please revert the application to the state it was in before the changes for version 1.3.0."

Or, for the most recent change:

> "Please undo the last set of changes you made."

The AI will then restore the file contents to their previous state, effectively rolling back the last update.
