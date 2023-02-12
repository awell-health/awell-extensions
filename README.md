# Content

This repo contains the implementation of the plugin server (in `src`), as well as the actual plugin code (in `plugins`) and the types to support plugin development (`lib`).

Note that it uses yarn PnP which might require additional configuration in your IDE to work properly. If you are using VSCode, use the workspace configuration provided in `.vscode/` and everything will be ready to go. If you use a different IDE, check the [yarn documentation](https://yarnpkg.com/features/pnp#compatibility-table) for instructions on IDE setup.

# How to create a new plugin

Create a new directory in `plugins` for the new plugin. Have a look at the sample plugin implementation in `plugins/hello-world`. It illustrates how to declare a plugin, and how to define actions handled by that plugin.

Once the plugin is ready for testing, add it to the exported plugins array in `plugins/index.ts` and it will be automatically picked up by the plugin server.

# How to test a plugin implementation

The recommended approach is to use jest to run unit tests against the plugin code. If needed you can also run the full plugin server application using the pub sub emulator:

- Follow instructions [here](https://cloud.google.com/pubsub/docs/emulator) to install the PubSub emulator.
- Start the emulator and set environment variables
- Run the app using `yarn dev`
- Send sample messages to pubsub using `yarn test:publish-new-activity`