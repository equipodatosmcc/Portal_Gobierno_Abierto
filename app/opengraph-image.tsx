import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #003366 0%, #004899 50%, #0066cc 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative top strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #3399ff, #00cc88, #66bbff)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#99ccff",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Municipalidad de Corrientes
          </div>

          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Portal de
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#66ccff",
              lineHeight: 1.1,
              marginTop: -16,
            }}
          >
            Gobierno Abierto
          </div>

          <div
            style={{
              fontSize: 26,
              color: "#b3d9ff",
              maxWidth: 700,
              lineHeight: 1.5,
              marginTop: 8,
            }}
          >
            Transparencia, participación ciudadana y datos abiertos al servicio de los correntinos.
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "#6699cc",
          }}
        >
          gobiernoabierto.ciudaddecorrientes.gov.ar
        </div>
      </div>
    ),
    { ...size },
  );
}
