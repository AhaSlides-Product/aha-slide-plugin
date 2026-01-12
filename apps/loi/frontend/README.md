# Sample Slide Frontend

[← Back to Root](../../README.md)

This is a sample slide presenter application built with Vue 3 and Vite. It demonstrates how to use the `@aha/ui` and `@aha/presenter-utils` packages for state synchronization and slide data management.

## Local Development (Standalone Mode)

To run this application standalone (without being embedded in an iframe), you need to enable the development polyfill provided by `@aha/dev`.

### Configuration

1.  **Copy the environment template**:
    ```bash
    cp .env.sample .env
    ```

2.  **Enable the Mock Frame**:
    Ensure `VITE_AHA_MOCK_FRAME=true` is set in your `.env` file. This tells the application to initialize `initDev()` from `@aha/dev`, which intercepts `postMessage` requests and polyfills the communication with real API calls.

3.  **Set your API Token**:
    Update `VITE_AHA_TOKEN` with a valid JWT token to authenticate against the development API.

4.  **Set Default Slide ID**:
    Update `VITE_AHA_DEFAULT_SLIDE` to the ID of the slide you want to load by default.

### Running the App

From the project root:
```bash
npm run dev -w @aha/loi-frontend
```

Or from this directory:
```bash
npm run dev
```

## For App Developers

When building the frontend for a new slide plugin, your application is expected to provide the following routes to handle different context within AhaSlides:

- `/settings/:slideId`: The right-side configuration panel in the presentation editor.
- `/canvas/:slideId`: The main content area in the presentation editor (preview).
- `/presenting/:slideId`: The main content view shown to the presenter during a live session.
- `/audience/:slideId`: The view shown to the audience members on their devices.

## Features

- **Cross-Tab Sync**: Uses `useSync` and `useSyncReadOnly` from `@aha/ui` for instant state synchronization between the Canvas and Settings pages across different browser tabs.
- **Backend Integration**: Uses `useSlideUtils` from `@aha/presenter-utils` for fetching and updating slide attributes with a 500ms debounce.
- **Responsive Layout**: Powered by Ant Design Vue.
