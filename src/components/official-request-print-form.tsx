"use client";

import React from "react";
import { DigitalSignatureStamp } from "@/components/digital-signature";

export interface PrintableRequestData {
  id: number;
  createdAt: Date | string;
  purpose?: string | null;
  status: string;
  reason?: string | null;
  reviewedAt?: Date | string | null;
  handedOverAt?: Date | string | null;
  requester: {
    name: string;
    email?: string;
    nik?: string | null;
  };
  reviewer?: {
    name: string;
    email?: string;
    nik?: string | null;
    role: string;
  } | null;
  handedOverByUser?: {
    name: string;
    email?: string;
    nik?: string | null;
    role: string;
  } | null;
  requestItems: Array<{
    id: number;
    quantity: number;
    note?: string | null;
    item: {
      name: string;
      unit: string;
    };
  }>;
}

interface OfficialRequestPrintFormProps {
  request: PrintableRequestData;
}

export function OfficialRequestPrintForm({ request }: OfficialRequestPrintFormProps) {
  const totalQuantity = request.requestItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalItemsCount = request.requestItems.length;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "disetujui":
        return "Disetujui Atasan";
      case "diserahkan":
        return "Barang Telah Diserahkan";
      case "ditolak":
        return "Ditolak Atasan";
      default:
        return "Menunggu Persetujuan";
    }
  };

  const formattedCreatedDate = new Date(request.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedCreatedTime = new Date(request.createdAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const printDateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const tableHeaderBg = "#f1f5f9";
  const cellBorderStyle = "1px solid #000000";
  const tableBorderStyle = "1.5px solid #000000";

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        width: "100%",
        boxSizing: "border-box",
        background: "#ffffff",
        color: "#000000",
        fontSize: "9.5pt",
        lineHeight: "1.4",
        padding: "2px",
      }}
    >
      {/* Kop Surat Perusahaan */}
      <div
        style={{
          borderBottom: "3px double #000000",
          paddingBottom: "8px",
          marginBottom: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "12.5pt",
              fontWeight: "bold",
              margin: "0",
              letterSpacing: "0.3px",
              color: "#000000",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            PT UNINDO AJIDHARMA INDUSTRY
          </h1>
          <p style={{ fontSize: "8.5pt", color: "#444444", margin: "2px 0 0 0" }}>
            Divisi Manufaktur &amp; Sistem Permintaan Barang Produksi
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              margin: "0",
              textTransform: "uppercase",
              textDecoration: "underline",
              color: "#000000",
            }}
          >
            FORM PERMINTAAN BARANG PRODUKSI
          </h2>
          <p style={{ fontSize: "9pt", fontWeight: "bold", margin: "3px 0 0 0", color: "#000000" }}>
            No. Registrasi: NGR-REQ-#{request.id}
          </p>
          <p style={{ fontSize: "8pt", color: "#555555", margin: "1px 0 0 0" }}>
            Tgl Cetak: {printDateStr} WIB
          </p>
        </div>
      </div>

      {/* Structured Information Table */}
      <table
        style={{
          width: "100%",
          tableLayout: "fixed",
          borderCollapse: "collapse",
          border: tableBorderStyle,
          boxSizing: "border-box",
          fontSize: "8.5pt",
          marginBottom: "14px",
          background: "#ffffff",
        }}
      >
        <tbody>
          <tr>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", width: "18%", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
              No. Permintaan
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", width: "32%", fontWeight: "bold", boxSizing: "border-box" }}>
              NGR-REQ-#{request.id}
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", width: "18%", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
              Tanggal Pengajuan
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", width: "32%", boxSizing: "border-box" }}>
              {formattedCreatedDate} ({formattedCreatedTime} WIB)
            </td>
          </tr>
          <tr>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
              Pemohon (Leader)
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box" }}>
              {request.requester.name} ({request.requester.nik || request.requester.email})
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
              Status Dokumen
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", textTransform: "uppercase", boxSizing: "border-box" }}>
              {getStatusLabel(request.status)}
            </td>
          </tr>
          <tr>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
              Keperluan Produksi
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box" }}>
              {request.purpose || "-"}
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
              Penyetuju (Supervisor/PM)
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box" }}>
              {request.reviewer ? `${request.reviewer.name} (${request.reviewer.nik || request.reviewer.email})` : "-"}
            </td>
          </tr>
          {request.reviewedAt && (
            <tr>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
                Tanggal Persetujuan
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box" }}>
                {new Date(request.reviewedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
                Catatan Keputusan
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box" }}>
                {request.reason || "-"}
              </td>
            </tr>
          )}
          {request.handedOverAt && (
            <tr>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
                Waktu Penyerahan
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box" }}>
                {new Date(request.handedOverAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                (
                {new Date(request.handedOverAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB)
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", background: tableHeaderBg, boxSizing: "border-box" }}>
                Petugas Penyerah
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box" }}>
                {request.handedOverByUser
                  ? `${request.handedOverByUser.name} (${
                      request.handedOverByUser.role === "ga"
                        ? "Tim GA"
                        : request.handedOverByUser.role === "purchasing"
                        ? "Purchasing"
                        : request.handedOverByUser.role
                    })`
                  : "-"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Goods Detail Table */}
      <div style={{ marginBottom: "5px", fontWeight: "bold", fontSize: "9pt" }}>
        RINCIAN BARANG PRODUKSI YANG DIMINTA:
      </div>
      <table
        style={{
          width: "100%",
          tableLayout: "fixed",
          borderCollapse: "collapse",
          border: tableBorderStyle,
          boxSizing: "border-box",
          fontSize: "8.5pt",
          marginBottom: "20px",
          background: "#ffffff",
        }}
      >
        <thead>
          <tr style={{ background: tableHeaderBg }}>
            <th style={{ border: cellBorderStyle, padding: "5px", width: "6%", textAlign: "center", boxSizing: "border-box" }}>
              NO
            </th>
            <th style={{ border: cellBorderStyle, padding: "5px 8px", width: "34%", textAlign: "left", boxSizing: "border-box" }}>
              NAMA BARANG PRODUKSI
            </th>
            <th style={{ border: cellBorderStyle, padding: "5px", width: "12%", textAlign: "center", boxSizing: "border-box" }}>
              SATUAN
            </th>
            <th style={{ border: cellBorderStyle, padding: "5px 8px", width: "18%", textAlign: "right", boxSizing: "border-box" }}>
              JUMLAH DIMINTA
            </th>
            <th style={{ border: cellBorderStyle, padding: "5px 8px", width: "30%", textAlign: "left", boxSizing: "border-box" }}>
              CATATAN / SPESIFIKASI KHUSUS
            </th>
          </tr>
        </thead>
        <tbody>
          {request.requestItems.map((ri, idx) => (
            <tr key={ri.id}>
              <td style={{ border: cellBorderStyle, padding: "5px", textAlign: "center", boxSizing: "border-box" }}>
                {idx + 1}
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", fontWeight: "bold", boxSizing: "border-box", wordBreak: "break-word" }}>
                {ri.item.name}
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px", textAlign: "center", boxSizing: "border-box" }}>
                {ri.item.unit}
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", textAlign: "right", fontWeight: "bold", boxSizing: "border-box" }}>
                {ri.quantity} {ri.item.unit}
              </td>
              <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box", wordBreak: "break-word" }}>
                {ri.note || "-"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: "bold", background: tableHeaderBg }}>
            <td colSpan={3} style={{ border: cellBorderStyle, padding: "5px 8px", textAlign: "right", boxSizing: "border-box" }}>
              TOTAL REKAPITULASI:
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", textAlign: "right", boxSizing: "border-box" }}>
              {totalQuantity} Unit
            </td>
            <td style={{ border: cellBorderStyle, padding: "5px 8px", boxSizing: "border-box" }}>
              ({totalItemsCount} Jenis Barang)
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 3-Party Signatures Block */}
      <div style={{ marginTop: "24px", pageBreakInside: "avoid" }}>
        <table className="no-border-table" style={{ width: "100%", tableLayout: "fixed", border: "none", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 4px" }}>
                <DigitalSignatureStamp
                  title="Pemohon (Production Leader)"
                  signerName={request.requester.name}
                  signerRole="Production Leader"
                  timestamp={request.createdAt}
                  statusText="DIGITAL SIGNATURE VERIFIED"
                  requestId={request.id}
                  type="requester"
                />
              </td>
              <td style={{ border: "none", width: "33.33%", textAlign: "center", verticalAlign: "top", padding: "0 4px" }}>
                <DigitalSignatureStamp
                  title="Penyetuju (Supervisor / PM)"
                  signerName={request.reviewer?.name}
                  signerRole={
                    request.reviewer?.role
                      ? request.reviewer.role === "supervisor"
                        ? "Supervisor"
                        : "Plant Manager"
                      : undefined
                  }
                  timestamp={request.reviewedAt}
                  statusText="DIGITAL APPROVAL VERIFIED"
                  requestId={request.id}
                  type="reviewer"
                />
              </td>
              <td style={{ border: "none", width: "33.34%", textAlign: "center", verticalAlign: "top", padding: "0 4px" }}>
                <DigitalSignatureStamp
                  title="Penyerah Barang"
                  signerName={request.handedOverByUser?.name}
                  signerRole={
                    request.handedOverByUser?.role === "ga"
                      ? "Tim GA"
                      : request.handedOverByUser?.role === "purchasing"
                      ? "Purchasing"
                      : request.handedOverByUser?.role
                  }
                  timestamp={request.handedOverAt}
                  statusText="DIGITAL HANDOVER VERIFIED"
                  requestId={request.id}
                  type="handover"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div
        style={{
          marginTop: "20px",
          borderTop: "1px solid #cccccc",
          paddingTop: "5px",
          fontSize: "7.5pt",
          color: "#555555",
          textAlign: "center",
        }}
      >
        Dokumen ini diproses dan dicetak secara otomatis dari Sistem Informasi Internal PT Unindo Ajidharma Industry. Sah sebagai bukti serah terima barang produksi.
      </div>
    </div>
  );
}
