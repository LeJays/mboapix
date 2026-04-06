import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const endpoint = process.env.NEXT_PUBLIC_B2_ENDPOINT;
    const bucketName = process.env.NEXT_PUBLIC_B2_BUCKET_NAME;

    const s3 = new S3Client({
      endpoint: `https://${endpoint}`,
      credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
      },
      region: process.env.NEXT_PUBLIC_B2_REGION,
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. On envoie le fichier sur Backblaze
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    }));
    
    // 2. ON NE GÉNÈRE PLUS DE SIGNED URL ICI
    // On renvoie simplement le chemin vers ton API proxy media
    // Ce lien passera par ton fichier app/api/media/[...path]/route.ts
    const permanentUrl = `/api/media/${fileName}`;
    
    return NextResponse.json({ url: permanentUrl });

  } catch (error: any) {
    console.error("Erreur Upload:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}