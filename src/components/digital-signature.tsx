"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { encodeRequestId } from "@/lib/hash-id";

interface DigitalSignatureProps {
  title: string;
  signerName?: string | null;
  signerRole?: string | null;
  timestamp?: Date | string | null;
  statusText?: string;
  requestId: number;
  type: "requester" | "reviewer" | "warehouse" | "handover";
}

export function DigitalSignatureStamp({
  title,
  signerName,
  signerRole,
  timestamp,
  statusText = "VERIFIED DIGITAL SIGNATURE",
  requestId,
  type: _type,
}: DigitalSignatureProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      new Date(timestamp).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " WIB"
    : null;

  useEffect(() => {
    if (signerName && timestamp) {
      // Encrypted URL token for public verification landing page
      const hashToken = encodeRequestId(requestId);
      const verifyUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/verifikasi/${hashToken}`
          : `http://localhost:3000/verifikasi/${hashToken}`;

      QRCode.toDataURL(verifyUrl, {
        width: 130,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Gagal membuat QR Code:", err));
    }
  }, [requestId, signerName, timestamp]);

  if (!signerName || !timestamp) {
    return (
      <div style={{ textAlign: "center", width: "100%" }}>
        <p style={{ fontSize: "9pt", fontWeight: "bold", margin: "0 0 85px 0" }}>
          {title}
        </p>
        <p style={{ fontSize: "9pt", borderBottom: "1.5px solid #000", paddingBottom: "2px", fontWeight: "bold", margin: "0", display: "inline-block", minWidth: "160px" }}>
          (...........................)
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <p style={{ fontSize: "9pt", fontWeight: "bold", margin: "0 0 6px 0" }}>
        {title}
      </p>

      {/* Digital Stamp - No Box */}
      <div
        style={{
          padding: "8px 10px",
          background: "#ffffff",
          margin: "0 auto",
          maxWidth: "200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* Centered QR Code Image */}
        {qrCodeDataUrl ? (
          <img
            src={qrCodeDataUrl}
            alt="QR Code Verifikasi Tanda Tangan"
            style={{ width: "64px", height: "64px", display: "block", margin: "0 auto 4px auto" }}
          />
        ) : (
          <div style={{ width: "64px", height: "64px", border: "1px solid #ccc", background: "#f9f9f9", margin: "0 auto 4px auto" }} />
        )}

        <div style={{ borderTop: "1px solid #000", paddingTop: "4px", marginTop: "2px", width: "100%" }}>
          <p style={{ fontSize: "7.5pt", fontWeight: "bold", margin: "0", color: "#000", textTransform: "uppercase", letterSpacing: "0.3px" }}>
            {statusText}
          </p>
          <p style={{ fontSize: "8.5pt", fontWeight: "bold", margin: "1px 0 0 0", color: "#000" }}>
            {signerName}
          </p>
          {signerRole && (
            <p style={{ fontSize: "7.5pt", margin: "0", color: "#444" }}>
              ({signerRole})
            </p>
          )}
          {formattedTime && (
            <p style={{ fontSize: "7pt", margin: "2px 0 0 0", color: "#000", fontWeight: "bold" }}>
              TTD: {formattedTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
