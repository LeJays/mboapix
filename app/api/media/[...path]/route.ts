import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

const s3 = new S3Client({
  endpoint: `https://${process.env.NEXT_PUBLIC_B2_ENDPOINT}`,
  region: process.env.NEXT_PUBLIC_B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 20000, // 20s pour établir connexion
    socketTimeout: 40000,     // 40s pour télécharger
  }),
});

// Note l'utilisation de Promise pour les params
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ path: string[] }> } 
) {
  // CORRECT : On attend (await) les params avant de les utiliser
  const resolvedParams = await params;
  const filePath = resolvedParams.path.join('/');
  
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_B2_BUCKET_NAME,
      Key: filePath,
    });

    const response = await s3.send(command);

    // Transformation du flux en binaire
    const uint8Array = await response.Body?.transformToByteArray();

    if (!uint8Array) {
      return NextResponse.json({ error: "Fichier vide" }, { status: 404 });
    }

    // Conversion en Buffer pour éviter l'erreur de type BodyInit
    const buffer = Buffer.from(uint8Array);

    return new Response(buffer, {
      status: 200,
      headers: { 
        "Content-Type": response.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("Erreur Proxy Media:", e);
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
  }
}