import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  endpoint: `https://${process.env.NEXT_PUBLIC_B2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
  region: process.env.NEXT_PUBLIC_B2_REGION,
});

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();
    const bucketName = process.env.NEXT_PUBLIC_B2_BUCKET_NAME;

    console.log("Requête de suppression reçue pour :", fileName);

    if (!fileName) {
      return NextResponse.json({ error: "Nom de fichier manquant" }, { status: 400 });
    }

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