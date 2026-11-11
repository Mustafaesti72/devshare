import { ImageResponse } from "next/og";
export const alt = "DevShare — discover open source developer tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#f7f8fa",
          padding: 80,
          color: "#202b31",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, color: "#286b59" }}>
          DevShare / Open source index
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 78,
            fontWeight: 700,
            letterSpacing: -4,
            marginTop: 70,
            lineHeight: 1.05,
          }}
        >
          Find the tools.
          <br />
          Read the source.
        </div>
        <div style={{ fontSize: 27, marginTop: 42, color: "#626e73" }}>
          Developer projects, practical guides and maintainer stories.
        </div>
      </div>
    ),
    size,
  );
}
