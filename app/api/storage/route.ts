import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getS3Client() {
  const endpoint = process.env.NEXT_PUBLIC_B2_ENDPOINT
  const keyId = process.env.B2_KEY_ID
  const appKey = process.env.B2_APPLICATION_KEY

  if (!endpoint || !keyId || !appKey) {
    return null
  }

  return new S3Client({
    endpoint: `https://${endpoint}`,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: appKey,
    },
    region: process.env.NEXT_PUBLIC_B2_REGION || "us-east-005",
  })
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null
  return createClient(url, key)
}

function formatStorageBytes(bytes: number): string {
  if (bytes <= 0) return "0 Mo"
  const gb = bytes / (1024 ** 3)
  const mb = bytes / (1024 ** 2)
  if (gb >= 1) {
    return `${gb.toFixed(2)} Go`
  }
  return `${mb.toFixed(1)} Mo`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({
        usedBytes: 0,
        limitBytes: 2147483648,
        storagePercent: 0,
        usedFormatted: "0 Mo",
        limitFormatted: "2 Go",
        message: "Supabase non configuré",
      })
    }

    // 1. Récupérer le profil et sa limite
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, storage_limit, storage_used")
      .eq("id", userId)
      .single()

    const limitBytes = Number(profile?.storage_limit) || 2147483648 // 2 Go par défaut

    // 2. Récupérer toutes les galeries du profil
    const { data: galleries } = await supabase
      .from("galleries")
      .select("id, cover_url")
      .eq("photographer_id", userId)

    const galleryIds = (galleries || []).map((g) => g.id)

    // 3. Calculer le poids des photos dans la base (gallery_photos)
    let dbPhotosBytes = 0
    let totalPhotosCount = 0

    if (galleryIds.length > 0) {
      const { data: photos, count } = await supabase
        .from("gallery_photos")
        .select("id, size, url", { count: "exact" })
        .in("gallery_id", galleryIds)

      if (photos && photos.length > 0) {
        totalPhotosCount = count ?? photos.length
        dbPhotosBytes = photos.reduce((acc, p) => {
          const s = Number(p.size)
          return acc + (Number.isFinite(s) && s > 0 ? s : 0)
        }, 0)
      }
    }

    // 4. Si Backblaze B2 est configuré, scanner les objets cloud réels
    let b2TotalBytes = 0
    const s3 = getS3Client()
    const bucketName = process.env.NEXT_PUBLIC_B2_BUCKET_NAME

    if (s3 && bucketName) {
      try {
        // Objets sous le dossier du profil (avatar, favicon, logos, etc.)
        const userCmd = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: `${userId}/`,
        })
        const userRes = await s3.send(userCmd)
        if (userRes.Contents) {
          for (const item of userRes.Contents) {
            b2TotalBytes += item.Size || 0
          }
        }

        // Objets sous chaque galerie
        for (const gId of galleryIds) {
          const galCmd = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `${gId}/`,
          })
          const galRes = await s3.send(galCmd)
          if (galRes.Contents) {
            for (const item of galRes.Contents) {
              b2TotalBytes += item.Size || 0
            }
          }
        }
      } catch (s3Error) {
        console.warn("Erreur scan S3 B2:", s3Error)
      }
    }

    // Prendre la valeur la plus précise : soit le scan S3, soit le cumul des photos en base
    const totalBytes = Math.max(b2TotalBytes, dbPhotosBytes)

    // 5. Mettre à jour profiles.storage_used pour maintenir la cohérence
    if (profile?.id && totalBytes !== Number(profile.storage_used)) {
      try {
        await supabase
          .from("profiles")
          .update({ storage_used: totalBytes })
          .eq("id", userId)
      } catch (updateErr) {
        console.warn("Impossible de synchroniser profiles.storage_used:", updateErr)
      }
    }

    const storagePercent = limitBytes > 0
      ? Math.min(Math.round((totalBytes / limitBytes) * 100), 100)
      : 0

    return NextResponse.json({
      usedBytes: totalBytes,
      limitBytes,
      storagePercent,
      usedFormatted: formatStorageBytes(totalBytes),
      limitFormatted: formatStorageBytes(limitBytes),
      photosCount: totalPhotosCount,
      galleriesCount: galleryIds.length,
      cloudSource: b2TotalBytes > 0 ? "backblaze_b2" : "supabase_storage",
      success: true,
    })
  } catch (error: any) {
    console.error("Erreur API storage:", error)
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
  }
}
