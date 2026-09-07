// app/api/download-notebook/route.ts - Endpoint para download do script de assessment (.ipynb)
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lake = searchParams.get("lake") || "bigquery";

    // Por enquanto, o lake suportado é BigQuery
    let fileName = "gcp_enterprise_metadata_assessment.ipynb";
    let filePath = path.join(process.cwd(), "public", "downloads", fileName);

    // Fallback se não estiver em public/downloads
    if (!fs.existsSync(filePath)) {
      const homePath = path.join(process.env.HOME || "", "Downloads", fileName);
      if (fs.existsSync(homePath)) {
        filePath = homePath;
      }
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Notebook de assessment não encontrado no servidor." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ipynb+json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Erro ao realizar download do notebook:", error);
    return NextResponse.json(
      { error: "Falha ao baixar script de assessment." },
      { status: 500 }
    );
  }
}
