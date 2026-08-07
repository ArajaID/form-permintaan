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
    email: string;
  };
  reviewer?: {
    name: string;
    email: string;
    role: string;
  } | null;
  handedOverByUser?: {
    name: string;
    email: string;
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

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        width: "100%",
        margin: "0",
        padding: "0",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      {/* Kop Surat Perusahaan */}
      <div
        style={{
          borderBottom: "3px double #000",
          paddingBottom: "10px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "16pt",
                fontWeight: "bold",
                margin: "0",
                letterSpacing: "0.5px",
                color: "#000",
              }}
            >
              PT UNINDO AJIDHARMA INDUSTRY
            </h1>
            <p style={{ fontSize: "8.5pt", color: "#555", margin: "2px 0 0 0" }}>
              Divisi Manufaktur & Sistem Permintaan Barang Produksi
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2
              style={{
                fontSize: "12pt",
                fontWeight: "bold",
                margin: "0",
                textTransform: "uppercase",
                textDecoration: "underline",
              }}
            >
              FORM PERMINTAAN BARANG PRODUKSI
            </h2>
            <p
              style={{
                fontSize: "9.5pt",
                fontWeight: "bold",
                margin: "4px 0 0 0",
                color: "#000",
              }}
            >
              No. Registrasi: NGR-REQ-#{request.id}
            </p>
            <p style={{ fontSize: "8pt", color: "#444", margin: "2px 0 0 0" }}>
              Tgl Cetak:{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              WIB
            </p>
          </div>
        </div>
      </div>

      {/* Structured Information Grid */}
      <div style={{ marginBottom: "16px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "9pt",
            border: "1.5px solid #000",
            background: "#ffffff",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  width: "18%",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                No. Permintaan
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  width: "32%",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                NGR-REQ-#{request.id}
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  width: "18%",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                Tanggal Pengajuan
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  width: "32%",
                  background: "#ffffff",
                }}
              >
                {new Date(request.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                (
                {new Date(request.createdAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB)
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                Pemohon (Leader)
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  background: "#ffffff",
                }}
              >
                {request.requester.name} ({request.requester.email})
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                Status Document
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  background: "#ffffff",
                }}
              >
                {getStatusLabel(request.status)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                Keperluan Produksi
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  background: "#ffffff",
                }}
              >
                {request.purpose || "-"}
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                Penyetuju (Supervisor/PM)
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  background: "#ffffff",
                }}
              >
                {request.reviewer
                  ? `${request.reviewer.name} (${request.reviewer.email})`
                  : "-"}
              </td>
            </tr>
            {request.reviewedAt && (
              <tr>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    fontWeight: "bold",
                    background: "#ffffff",
                  }}
                >
                  Tanggal Persetujuan
                </td>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    background: "#ffffff",
                  }}
                >
                  {new Date(request.reviewedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    fontWeight: "bold",
                    background: "#ffffff",
                  }}
                >
                  Catatan Keputusan
                </td>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    background: "#ffffff",
                  }}
                >
                  {request.reason || "-"}
                </td>
              </tr>
            )}
            {request.handedOverAt && (
              <tr>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    fontWeight: "bold",
                    background: "#ffffff",
                  }}
                >
                  Waktu Penyerahan
                </td>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    background: "#ffffff",
                  }}
                >
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
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    fontWeight: "bold",
                    background: "#ffffff",
                  }}
                >
                  Petugas Penyerah (GA/Purchasing)
                </td>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    background: "#ffffff",
                  }}
                >
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
      </div>

      {/* Goods Detail Table */}
      <div style={{ marginBottom: "6px", fontWeight: "bold", fontSize: "9.5pt" }}>
        RINCIAN BARANG PRODUKSI YANG DIMINTA:
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "9pt",
          marginBottom: "25px",
          background: "#ffffff",
        }}
      >
        <thead>
          <tr style={{ background: "#ffffff" }}>
            <th
              style={{
                border: "1.5px solid #000",
                padding: "6px",
                width: "35px",
                textAlign: "center",
                background: "#ffffff",
              }}
            >
              NO
            </th>
            <th
              style={{
                border: "1.5px solid #000",
                padding: "6px",
                textAlign: "left",
                background: "#ffffff",
              }}
            >
              NAMA BARANG PRODUKSI
            </th>
            <th
              style={{
                border: "1.5px solid #000",
                padding: "6px",
                width: "80px",
                textAlign: "center",
                background: "#ffffff",
              }}
            >
              SATUAN
            </th>
            <th
              style={{
                border: "1.5px solid #000",
                padding: "6px",
                width: "110px",
                textAlign: "right",
                background: "#ffffff",
              }}
            >
              JUMLAH DIMINTA
            </th>
            <th
              style={{
                border: "1.5px solid #000",
                padding: "6px",
                textAlign: "left",
                background: "#ffffff",
              }}
            >
              CATATAN / SPESIFIKASI KHUSUS
            </th>
          </tr>
        </thead>
        <tbody>
          {request.requestItems.map((ri, idx) => (
            <tr key={ri.id} style={{ background: "#ffffff" }}>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px",
                  textAlign: "center",
                  background: "#ffffff",
                }}
              >
                {idx + 1}
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                {ri.item.name}
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px",
                  textAlign: "center",
                  background: "#ffffff",
                }}
              >
                {ri.item.unit}
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px",
                  textAlign: "right",
                  fontWeight: "bold",
                  background: "#ffffff",
                }}
              >
                {ri.quantity} {ri.item.unit}
              </td>
              <td
                style={{
                  border: "1.5px solid #000",
                  padding: "6px",
                  background: "#ffffff",
                }}
              >
                {ri.note || "-"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: "#ffffff", fontWeight: "bold" }}>
            <td
              colSpan={3}
              style={{
                border: "1.5px solid #000",
                padding: "6px 8px",
                textAlign: "right",
                background: "#ffffff",
              }}
            >
              TOTAL REKAPITULASI:
            </td>
            <td
              style={{
                border: "1.5px solid #000",
                padding: "6px 8px",
                textAlign: "right",
                background: "#ffffff",
              }}
            >
              {totalQuantity} Unit
            </td>
            <td
              style={{
                border: "1.5px solid #000",
                padding: "6px 8px",
                background: "#ffffff",
              }}
            >
              ({totalItemsCount} Jenis Barang)
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 3-Party Signatures Block - Digital Signature Stamps */}
      <div style={{ marginTop: "30px", pageBreakInside: "avoid" }}>
        <table
          style={{
            width: "100%",
            border: "none",
            borderCollapse: "collapse",
            background: "#ffffff",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "none",
                  width: "33.33%",
                  textAlign: "center",
                  verticalAlign: "top",
                  padding: "0 5px",
                  background: "#ffffff",
                }}
              >
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
              <td
                style={{
                  border: "none",
                  width: "33.33%",
                  textAlign: "center",
                  verticalAlign: "top",
                  padding: "0 5px",
                  background: "#ffffff",
                }}
              >
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
              <td
                style={{
                  border: "none",
                  width: "33.33%",
                  textAlign: "center",
                  verticalAlign: "top",
                  padding: "0 5px",
                  background: "#ffffff",
                }}
              >
                <DigitalSignatureStamp
                  title="Penyerah Barang (GA / Purchasing)"
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
          marginTop: "25px",
          borderTop: "1px solid #ddd",
          paddingTop: "6px",
          fontSize: "7.5pt",
          color: "#666",
          textAlign: "center",
        }}
      >
        Dokumen ini diproses dan dicetak secara otomatis dari Sistem Informasi Internal PT Unindo Ajidharma Industry. Sah sebagai bukti serah terima barang produksi.
      </div>
    </div>
  );
}
