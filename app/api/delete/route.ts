import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

function getS3Client() {
  const endpoint = process.env.NEXT_PUBLIC_B2_ENDPOINT;
  return new S3Client({
    endpoint: endpoint ? `https://${endpoint}` : undefined,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID || '',
      secretAccessKey: process.env.B2_APPLICATION_KEY || '',
    },
    region: process.env.NEXT_PUBLIC_B2_REGION || 'us-east-005',
  });
}

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();
    const bucketName = process.env.NEXT_PUBLIC_B2_BUCKET_NAME;

    console.log("Requête de suppression reçue pour :", fileName);

    if (!fileName) {
      return NextResponse.json({ error: "Nom de fichier manquant" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_B2_ENDPOINT || !bucketName) {
      return NextResponse.json({ success: true, message: "Suppression simulée (B2 non configuré)" });
    }

    const s3 = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName, // Doit être le chemin relatif (ex: id/dossier/image.jpg)
    });

    await s3.send(command);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // On affiche l'erreur complète dans le terminal pour comprendre (403, 404, etc.)
    console.error("Détails erreur B2 DELETE:", error);
    return NextResponse.json({ 
      error: "Erreur B2", 
      message: error.message,
      code: error.$metadata?.httpStatusCode 
    }, { status: 500 });
  }
}