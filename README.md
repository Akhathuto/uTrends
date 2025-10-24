# uTrends - The Autonomous AI Content Suite

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://example.com)
[![Version](https://img.shields.io/badge/version-1.3.0-blue)](docs/CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](https://opensource.org/licenses/MIT)
[![Maintained by](https://img.shields.io/badge/maintained%20by-Edgtec-darkblue)](https://example.com)

**Your personal AI assistant and autonomous agent for content creation.**

---

uTrends is a revolutionary, all-in-one platform designed to streamline the entire workflow for modern content creators. It's more than just a set of tools; it's an intelligent partner that can understand high-level goals and execute complex tasks on your behalf. From discovering the next viral trend to generating complete video assets and planning strategic growth, uTrends provides a comprehensive suite of features powered by Google's state-of-the-art Gemini AI models.

## ✨ Key Features

-   **🤖 Autonomous AI Agent (Nolo AI):** Go beyond simple chat. Give the agent complex commands (e.g., *"Create a video about space travel and suggest thumbnails"*), and it will autonomously use the app's tools to complete the multi-step task, showing you its work in a real-time task log.
-   **🎨 Comprehensive Creation Suite:**
    -   **Media Generation:** Create high-quality images, logos, videos, animations, and GIFs from text prompts.
    -   **Script Writing:** Generate complete, well-structured video scripts with catchy titles, hooks, and calls to action.
    -   **Visual Design:** Design click-worthy thumbnail concepts and edit images with simple text commands.
-   **📈 Real-time Insights & Strategy:**
    -   **Trend Discovery:** Discover what's trending right now on YouTube and TikTok with live, interactive trend cards.
    -   **Strategic Planning:** Get custom growth plans, monetization guides, and in-depth keyword analysis to stay ahead of the curve.
    -   **Content Calendar:** Plan your weekly content schedule with AI-generated ideas tailored to your niche.
-   **🎙️ Live & Interactive Avatars:** Design your own AI avatar and engage in real-time voice conversations. Bring your characters to life by generating lip-synced video animations with custom dialogue and gestures.
-   **📚 Persistent Content Library:** Save your best scripts, growth plans, and thumbnail ideas to your personal "My Content" library, which persists in your browser for easy access.

## 🛠️ Technology Stack

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Engine:** Google Gemini API (including Gemini 2.5 Pro, Imagen 4.0, Veo, and the Live API for real-time voice)
-   **Core AI Features:** Leverages advanced **Function Calling** for autonomous agent capabilities and **Google Search grounding** for real-time information.
-   **Testing:** Vitest, React Testing Library

## 📂 Project Structure

A brief overview of the key directories in this project:

```
/
├── components/      # Reusable React components (Sidebar, Icons, etc.)
├── docs/            # Project documentation (Roadmap, Changelog)
├── hooks/           # Custom React hooks (useLocalStorage, useGeolocation)
├── tools/           # Core feature components, one for each tool in the app
├── utils/           # Utility functions (file/audio processing, agent tools)
├── App.tsx          # Main application component and router
└── index.tsx        # Application entry point
```

## 🚀 Getting Started

This project is designed to run in a specific AI-powered development environment. However, to set it up in a standard local environment, you would follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/edgtec/utrends.git
    cd utrends
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 🤝 Contributing

This project is developed via an AI-assisted, conversational process. To contribute or request changes:
1.  Clearly state the desired feature, enhancement, or bug fix.
2.  Provide as much detail as possible, including visual mockups if applicable.
3.  Use the "revert" command specified in the main documentation if an update causes issues.

## 🏢 About Edgtec

uTrends is a flagship product developed and maintained by **Edgtec**, a company dedicated to building cutting-edge AI solutions that empower creators and businesses. We believe in harnessing the power of artificial intelligence to unlock creativity and drive strategic growth.
