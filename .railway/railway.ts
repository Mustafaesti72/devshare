import { defineRailway, github, project, service, volume } from "railway/iac";
// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "devshare";
export default defineRailway(() => {
  const data = volume("devshare-volume", { sizeMB: 50000, region: "europe-west4-drams3a", allowOnlineResize: true, alerts: { usage: { "80": {}, "95": {}, "100": {} } } });
  const devshare = service("devshare", {
    source: github("Mustafaesti72/devshare", { branch: "main", checkSuites: false }),
    build: { buildEnvironment: "V3", builder: "DOCKERFILE" },
    volumeMounts: { "/data": data },
    healthcheck: "/api/health",
    healthcheckTimeout: 120,
    replicas: { "europe-west4-drams3a": 1 },
  });

  return project("devshare", {
    variables: { managed: false },
    resources: [devshare, data],
  });
});
