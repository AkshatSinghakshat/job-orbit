import { ShieldCheck } from "lucide-react";
import TrainingPageShell, { Notice, Panel } from "./TrainingPageShell";

export default function TrainingSecurity() {
  return (
    <TrainingPageShell
      title="Training Security"
      description="Security for your institute account is managed through your JobOrbit account credentials."
    >
      <div className="max-w-3xl">
        <Panel title="Account security">
          <div className="mb-4 flex items-center gap-3 text-blue-300">
            <ShieldCheck size={22} />
            <h2 className="font-semibold">Authentication is enabled</h2>
          </div>
          <Notice>
            Institute-specific security controls are not available yet. Your
            institute pages remain protected by the existing JobOrbit sign-in
            and role checks.
          </Notice>
        </Panel>
      </div>
    </TrainingPageShell>
  );
}
