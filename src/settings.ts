import { Topic, SettingsTreeNodes, SettingsTreeFields, SettingsTreeAction } from "@foxglove/extension";
import { produce } from "immer";
import * as _ from "lodash-es";

export type Config = {
    topicName: string;
    signalType: string;
    initialValue: number;
    finalValue: number;
    stepTime: number;
    slope: number;
    startTime: number;
    offset: number;
    amplitude: number;
    frequency: number;
    initialFrequency: number;
    targetFrequency: number;
    targetTime: number;
    publishRate: number;
    totalTime: number;
};

export function settingsActionReducer(prevConfig: Config, action: SettingsTreeAction): Config {
    return produce(prevConfig, (draft) => {
        if (action.action === "update") {
            const { path, value } = action.payload;
            _.set(draft, path.slice(1), value);
        }
    });
}

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
                .filter((topic) => topic.schemaName === "std_msgs/msg/Float64")
                .map((topic) => ({
                    label: topic.name,
                    value: topic.name,
                })),
        },
        // Signal type: choose in a dropdown list
        signalType: {
            label: "Signal type",
            input: "select",
            value: config.signalType,
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

    // Signal-specific parameters
    // This part of the settings tree is modified accordingly to the signal type chosen in "General"
    // This definitions follow the parameters defined in the reference_signal_srvs ROS package
    const parameterFields: SettingsTreeFields = {
        // Initial value: applicable to "step" and "ramp" signals
        // Signal value at initial time (t = 0)
        initialValue: 
            ["step", "ramp"].includes(config.signalType)
            ? {
                label: "Initial value",
                input: "number",
                value: config.initialValue,
            } : undefined,  
        // Final value: applicable to "step" signals only
        // Signal value at step time          
        finalValue:
            config.signalType === "step"
            ? {
                label: "Final value",
                input: "number",
                value: config.finalValue,
            } : undefined,
        // Step time: applicable to "step" signals only
        // Time at which the step occurs
        // The signal value changes from initialValue to finalValue
        stepTime:
            config.signalType === "step"
            ? {
                label: "Step time (s)",
                input: "number",
                value: config.stepTime,
                min: 0,
            } : undefined,
        // Slope: applicable to "ramp" signals only
        // Angular coefficient of the ramp signal
        slope:
            config.signalType === "ramp"
            ? {
                label: "Slope",
                input: "number",
                value: config.slope,
            } : undefined,
        // Start time: applicable to "ramp" signals only
        // Time at which the ramp starts
        startTime:
            config.signalType === "ramp"
            ? {
                label: "Start time (s)",
                input: "number",
                value: config.startTime,
                min: 0,
            } : undefined,
        // Offset: applicable to all waveform signals (sine, square, triangle, sawtooth and chirp)
        // The DC offset of the waveform
        offset:
            ["sine", "square", "triangle", "sawtooth", "chirp"].includes(config.signalType)
            ? {
                label: "Offset",
                input: "number",
                value: config.offset,
            } : undefined,
        // Amplitude: applicable to all waveform signals (sine, square, triangle, sawtooth and chirp)
        // Total amplitude of the signal
        amplitude:
            ["sine", "square", "triangle", "sawtooth", "chirp"].includes(config.signalType)
            ? {
                label: "Amplitude",
                input: "number",
                value: config.amplitude,
                min: 0,
            } : undefined,
        // Frequency: applicable to all waveform signals (sine, square, triangle, sawtooth), except chirp (does not have a fixed frequency)
        // The frequency of the waveform (different from publish rate, which is the frequency at which the corresponding ROS messages are published)
        frequency:
            ["sine", "square", "triangle", "sawtooth"].includes(config.signalType)
            ? {
                label: "Frequency (Hz)",
                input: "number",
                value: config.frequency,
                min: 0,
            } : undefined,
        // Initial frequency: applicable to chirp signals only
        // Signal frequency at initial time (t = 0)
        initialFrequency:
            config.signalType === "chirp"
            ? {
                label: "Initial frequency (Hz)",
                input: "number",
                value: config.initialFrequency,
                min: 0,
            } : undefined,
        // Target frequency: applicable to chirp signals only
        // Signal frequency at target time
        targetFrequency:
            config.signalType === "chirp"
            ? {
                label: "Target frequency (Hz)",
                input: "number",
                value: config.targetFrequency,
                min: 0,
            } : undefined,
        // Target time: applicable to chirp signals only
        // Time at which the chirp signal reaches its target frequency
        targetTime:
            config.signalType === "chirp"
            ? {
                label: "Target time (s)",
                input: "number",
                value: config.targetTime,
                min: 0,
            } : undefined,
    };

    // Nodes to build the settings tree that populates foxglove's panel settings
    const settings: SettingsTreeNodes = {
        general: {
            label: "General",
            fields: generalFields,
        },
        parameters: {
            label: "Signal parameters",
            fields: parameterFields,
        },
    };

    return settings;
}