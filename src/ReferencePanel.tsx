import { Immutable, PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { Button } from "@mui/material";
import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import _ from "lodash-es"

import { Config, buildSettingsTree, settingsActionReducer, DEFAULT_PATH } from "./settings";

function ReferencePanel({ context }: { context: PanelExtensionContext }): JSX.Element {
  const [topics, setTopics] = useState<undefined | Immutable<Topic[]>>();
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  // Set default values for all config fields
  const [config, setConfig] = useState<Config>(() => {
    const partialConfig = context.initialState as Partial<Config>;
    partialConfig.topicName ??= "";
    partialConfig.publishRate ??= 1;
    partialConfig.totalTime ??= Infinity;
    partialConfig.paths ??= [DEFAULT_PATH];
    return partialConfig as Config;
  });

  const settingsActionHandler = useCallback(
    (action:SettingsTreeAction) => {
      setConfig((prevConfig) => settingsActionReducer(prevConfig, action));
    },
    [setConfig],
  );

  // Resgister the settings tree
  useEffect(() => {
    context.updatePanelSettingsEditor({
      actionHandler: settingsActionHandler,
      nodes: buildSettingsTree(config, topics),
    });
  }, [config, context, settingsActionHandler, topics]);

  // We use a layout effect to setup render handling for our panel. We also setup some topic subscriptions.
  useLayoutEffect(() => {
    // The render handler is run by the broader studio system during playback when your panel
    // needs to render because the fields it is watching have changed. How you handle rendering depends on your framework.
    // You can only setup one render handler - usually early on in setting up your panel.
    //
    // Without a render handler your panel will never receive updates.
    //
    // The render handler could be invoked as often as 60hz during playback if fields are changing often.
    context.onRender = (renderState, done) => {
      // render functions receive a _done_ callback. You MUST call this callback to indicate your panel has finished rendering.
      // Your panel will not receive another render callback until _done_ is called from a prior render. If your panel is not done
      // rendering before the next render call, studio shows a notification to the user that your panel is delayed.
      //
      // Set the done callback into a state variable to trigger a re-render.
      setRenderDone(() => done);

      // We may have new topics - since we are also watching for messages in the current frame, topics may not have changed
      // It is up to you to determine the correct action when state has not changed.
      setTopics(renderState.topics);
    };

    // After adding a render handler, you must indicate which fields from RenderState will trigger updates.
    // If you do not watch any fields then your panel will never render since the panel context will assume you do not want any updates.

    // Tell the panel context that we care about any update to the _topic_ field of RenderState
    context.watch("topics");

    // Tell the panel context we want messages for the current frame for topics we've subscribed to
    // This corresponds to the _currentFrame_ field of render state.
    context.watch("currentFrame");
  }, [context]);

  // Invoke the done callback once the render is complete
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  // Save config and update default panel title
  useEffect(() => {
    context.saveState(config);
    context.setDefaultPanelTitle(`Reference Signal`);
  }, [config, context]);

  // Callback for the "Start" button. Triggers the corresponding service according to the chosen signal type
  const startPublishing = useCallback(async () => {
    await context.callService?.(
      // Service name is standardized as topic name + /setup
      config.topicName + "/start",
      {
        signal_type: config.paths.map(path => path.signalType),
        initial_value: config.paths.map(path => path.initialValue),
        final_value: config.paths.map(path => path.finalValue),
        start_time: config.paths.map(path => path.startTime),
        end_time: config.paths.map(path => path.endTime != undefined ? path.endTime : Infinity),
        slope: config.paths.map(path => path.slope),
        offset: config.paths.map(path => path.offset),
        amplitude: config.paths.map(path => path.amplitude),
        frequency: config.paths.map(path => path.frequency),
        phase: config.paths.map(path => path.phase),
        initial_frequency: config.paths.map(path => path.initialFrequency),
        target_frequency: config.paths.map(path => path.targetFrequency),
        target_time: config.paths.map(path => path.targetTime),
        publish_rate: config.publishRate,
        total_time: config.totalTime != undefined ? config.totalTime : Infinity,
      }
    )
  }, [config, context]);

  // Callback for the "Stop" button. Triggers the corresponding service, that simply stops publishing the reference signal
  const stopPublishing = useCallback(async () => {
    await context.callService?.(
      config.topicName + "/stop",
      {},
    );
  }, [config, context]);

  // Render the panel
  // The panel itself contains only the "Start" and "Stop" buttons
  // The signal is configured using the setting tree
  return (
    <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
      <div style={{ paddingBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Button variant="contained" color="success" onClick={startPublishing}>Start</Button>
        <Button variant="outlined" color="error" onClick={stopPublishing}>Stop</Button>
      </div>
    </div>
  );
}

export function initReferencePanel(context: PanelExtensionContext): () => void {
  ReactDOM.render(<ReferencePanel context={context} />, context.panelElement);

  // Return a function to run when the panel is removed
  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}
