import { Topic, SettingsTreeNode, SettingsTreeNodes, SettingsTreeFields, SettingsTreeAction } from "@foxglove/extension";
import memoizeWeak from "memoize-weak"
import { produce } from "immer";
import _ from "lodash-es";

// Parameters for each reference signal input
export type Path = {
    signalType: string;
    initialValue: number;
    finalValue: number;
    startTime: number;
    endTime: number;
    slope: number;
    offset: number;
    amplitude: number;
    frequency: number;
    phase: number;
    initialFrequency: number;
    targetFrequency: number;
    targetTime: number;
};

// Default parameters for Path
export const DEFAULT_PATH: Path = Object.freeze({
    signalType: "step",
    initialValue: 0,
    finalValue: 1,
    startTime: 0,
    endTime: Infinity,
    slope: 1,
    offset: 0,
    amplitude: 1,
    frequency: 1,
    phase: 0,
    initialFrequency: 0,
    targetFrequency: 1,
    targetTime: 1,
});

// Complete configuration (includes topic name, publish rate and total time)
export type Config = {
    topicName: string;
    publishRate: number;
    totalTime: number;
    paths: Path[];
};

// The settingsActionReducer responds to user interaction with the settings tree
export function settingsActionReducer(prevConfig: Config, action: SettingsTreeAction): Config {
    return produce(prevConfig, (draft) => {
        if (action.action === "update") {
            const { path, value } = action.payload;
            if (path[0] === "general") {
                _.set(draft, path.slice(1), value);
            } else {
                _.set(draft, path, value);
            }            
        } else if (action.action === "perform-node-action") {
            if (action.payload.id === "add-signal") {
                if (draft.paths.length === 0) {
                    draft.paths.push({ ...DEFAULT_PATH });
                }
                draft.paths.push({ ...DEFAULT_PATH });
            } else if (action.payload.id === "delete-signal") {
                const index = action.payload.path[1];
                draft.paths.splice(Number(index), 1);
            }
        }
    });
}

// Build a settings tree node for a single reference signal (1-DOF)
const makeSignalNode = memoizeWeak((index: number, path: Path, canDelete: boolean): SettingsTreeNode => {
    return {
        actions: canDelete
            ? [
                {
                    type: "action",
                    id: "delete-signal",
                    label: "Delete signal",
                    display: "inline",
                    icon: "Clear",
                },
            ] : [],
        label: `Signal ${index + 1}`,
        fields: {
            signalType: {
                label: "Signal type",
                input: "select",
                value: path.signalType,
                options: [
                    {
                        label: "Step",
                        value: "step",
                    },
                    {
                        label: "Ramp",
                        value: "ramp",
                    },
                    {
                        label: "Spline",
                        value: "spline",
                    },
                    {
                        label: "Sine",
                        value: "sine",
                    },
                    {
                        label: "Square",
                        value: "square",
                    },
                    {
                        label: "Triangle",
                        value: "triangle",
                    },
                    {
                        label: "Sawtooth",
                        value: "sawtooth",
                    },
                    {
                        label: "Chirp",
                        value: "chirp",
                    },
                ],
            },
            initialValue:
                // Initial value: applicable to "step", "ramp" and "spline" signals
                // Signal value from t = 0 to t = start_time
                ["step", "ramp", "spline"].includes(path.signalType)
                ? {
                    label: "Initial value",
                    input: "number",
                    value: path.initialValue,
                } : undefined,
            finalValue:
                // Final value: applicable to "step" and "spline" signals
                // Signal value from t = start_time to t = end_time
                ["step", "spline"].includes(path.signalType)
                ? {
                    label: "Final value",
                    input: "number",
                    value: path.finalValue,
                } : undefined,
            startTime:
                // Start time: applicable to all signals
                // Step: time at which value changes from initial_value to final_value
                // Ramp: time at which value starts changing from initial_value according to slope
                // Other waveforms: time at which the waveform starts
                {
                    label: "Start time (s)",
                    input: "number",
                    value: path.startTime,
                    min: 0,
                },
            endTime:
                // End time: applicable to all signals
                // Step: time at which value changes from final_value back to initial_value
                // Ramp: time at which value stops changing according to slope
                // Other waveforms: time at which the waveform stops
                {
                    label: "End time (s)",
                    input: "number",
                    value: path.endTime != undefined ? path.endTime : Infinity,
                    min: 0,
                    placeholder: "inf",
                },
            slope:
                // Slope: applicable to "ramp" signals only
                // Rate at which the output value changes, starting from initial_value
                path.signalType === "ramp"
                ? {
                    label: "Slope",
                    input: "number",
                    value: path.slope,
                } : undefined,
            offset:
                // Offset: applicable to waveform (sine, square, triangle, sawtooth, chirp) signals only
                // DC offset of the waveform
                ["sine", "square", "triangle", "sawtooth", "chirp"].includes(path.signalType)
                ? {
                    label: "Offset",
                    input: "number",
                    value: path.offset,
                } : undefined,
            amplitude:
                // Amplitude: applicable to waveform (sine, square, triangle, sawtooth, chirp) signals only
                // Total amplitude of the waveform
                ["sine", "square", "triangle", "sawtooth", "chirp"].includes(path.signalType)
                ? {
                    label: "Amplitude",
                    input: "number",
                    value: path.amplitude,
                } : undefined,
            frequency:
                // Frequency: applicable to waveform (sine, square, triangle, sawtooth) signals only
                // Frequency of the waveform
                ["sine", "square", "triangle", "sawtooth"].includes(path.signalType)
                ? {
                    label: "Frequency (Hz)",
                    input: "number",
                    value: path.frequency,
                    min: 0,
                } : undefined,
            phase:
                // Phase: applicable to waveform (sine, square, triangle, sawtooth, chirp) signals only
                // Phase shift of the waveform
                ["sine", "square", "triangle", "sawtooth", "chirp"].includes(path.signalType)
                ? {
                    label: "Phase (deg)",
                    input: "number",
                    value: path.phase,
                } : undefined,
            initialFrequency:
                // Initial frequency: applicable to chirp (frequency-swept cosine) signals only
                // Frequency at t = start_time
                path.signalType === "chirp"
                ? {
                    label: "Initial frequency (Hz)",
                    input: "number",
                    value: path.initialFrequency,
                    min: 0,
                } : undefined,
            targetFrequency:
                // Target frequency: applicable to chirp (frequency-swept cosine) signals only
                // Frequency at t = target_time
                path.signalType === "chirp"
                ? {
                    label: "Target frequency (Hz)",
                    input: "number",
                    value: path.targetFrequency,
                    min: 0,
                } : undefined,
            targetTime:
                // Target time: applicable to chirp (frequency-swept cosine) signals only
                // Time at which the frequency reaches target_frequency
                path.signalType === "chirp"
                ? {
                    label: "Target time (s)",
                    input: "number",
                    value: path.targetTime,
                    min: 0,
                } : undefined,
        }
    }
});

// Build the top-level signal tree (enabling user to add and remove DOFs)
const makeRootSignalNode = memoizeWeak((paths: Path[]): SettingsTreeNode => {
    const children = Object.fromEntries(
        paths.length === 0
            ? [
                ["0", makeSignalNode(0, DEFAULT_PATH, false)]
            ] : 
            paths.map((path, index) => [
                `${index}`,
                makeSignalNode(index, path, paths.length === 1 ? false : true),
            ]),
    );
    return {
        label: "Signals",
        children,
        actions: [
            {
                type: "action",
                id: "add-signal",
                label: "Add signal",
                display: "inline",
                icon: "Add",
            },
        ],
    };
});

// Build the complete settings tree
export function buildSettingsTree(config: Config, topics?: readonly Topic[]): SettingsTreeNodes {
    // General fields (applicable to all signal types)
    const generalFields: SettingsTreeFields = {
        // Topic name: choose in a dropdown list
        // Filtered for Float64 topics (as defined in the reference_signal_generator ROS package)
        topicName: {
            label: "Topic",
            input: "select",
            value: config.topicName,
            options: (topics ?? [])
                .filter((topic) => topic.schemaName === "std_msgs/msg/Float64MultiArray")
                .map((topic) => ({
                    label: topic.name,
                    value: topic.name,
                })),
        },
        // Publish rate: the rate at which the topic will publish messages
        publishRate: {
            label: "Publish rate (Hz)",
            input: "number",
            value: config.publishRate,
            min: 0,
        },
        // Total time: maximum time for the reference signal to be published
        // Leave blank for an infinite signal
        totalTime: {
            label: "Total time (s)",
            input: "number",
            value: config.totalTime != undefined ? config.totalTime : Infinity,
            min: 0,
            placeholder: "inf",
        },
    };

    // Nodes to build the settings tree that populates foxglove's panel settings
    const settings: SettingsTreeNodes = {
        general: {
            label: "General",
            fields: generalFields,
        },
        paths: makeRootSignalNode(config.paths),
    };

    return settings;
}