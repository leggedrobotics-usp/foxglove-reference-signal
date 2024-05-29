import { ExtensionContext } from "@foxglove/extension";
import { initReferencePanel } from "./ReferencePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "Reference Signal", initPanel: initReferencePanel });
}
