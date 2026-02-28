import React from 'react'
import { Container, Grid, Card, CardMedia, CardContent, Typography } from '@mui/material'

async function fetchVideosFromYouTube() {
  const key = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID
  const channelHandle = process.env.YOUTUBE_CHANNEL_HANDLE

  if (!key) throw new Error('Missing YOUTUBE_API_KEY env var on server')

  // Resolve channelId if handle provided
  let resolvedChannelId = channelId
  if (!resolvedChannelId && channelHandle) {
    const q = encodeURIComponent(channelHandle.replace(/^@/, ''))
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${q}&key=${key}`
    console.log('YouTube: resolving handle with URL:', searchUrl)
    const sres = await fetch(searchUrl)
    const stext = await sres.text()
    console.log('YouTube search raw response:', stext.substring(0, 200))
    const sjson = JSON.parse(stext)
    resolvedChannelId = sjson.items?.[0]?.snippet?.channelId
  }

  if (!resolvedChannelId) throw new Error('Missing channel id or handle')

  const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${resolvedChannelId}&key=${key}`
  console.log('YouTube: channels URL:', channelsUrl)
  const cres = await fetch(channelsUrl)
  const ctext = await cres.text()
  console.log('YouTube channels raw response:', ctext.substring(0, 200))
  const cjson = JSON.parse(ctext)
  const uploads = cjson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!uploads) throw new Error('Uploads playlist not found')

  const listUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=12&key=${key}`
  console.log('YouTube: playlistItems URL:', listUrl)
  const listRes = await fetch(listUrl)
  const ltext = await listRes.text()
  console.log('YouTube playlistItems raw response:', ltext.substring(0, 200))
  const listJson = JSON.parse(ltext)
  return listJson
}

export default async function YouTubePage() {
  let data
  try {
    data = await fetchVideosFromYouTube()
  } catch (e) {
    const msg = e?.message || String(e)
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4">تعذر تحميل الفيديوهات</Typography>
        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{msg}</Typography>
      </Container>
    )
  }

  const items = data.items || []

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>أحدث فيديوهات يوتيوب</Typography>
      <Grid container spacing={2} justifyContent="center">
        {items.map((it) => {
          const snip = it.snippet || {}
          const thumb = snip.thumbnails?.medium?.url || snip.thumbnails?.default?.url
          const title = snip.title
          const videoId = snip.resourceId?.videoId || (snip.resourceId && snip.resourceId.videoId)
          const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : snip.resourceId?.videoId
          return (
            <Grid item key={it.id} xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card sx={{ height: '100%', width: '100%', maxWidth: 360 }}>
                {thumb && <CardMedia component="img" height="180" image={thumb} alt={title} />}
                <CardContent>
                  <Typography variant="subtitle1">{title}</Typography>
                  {url && (
                    <Typography variant="body2" color="primary" component="a" href={url} target="_blank" rel="noopener noreferrer">
                      شاهد على يوتيوب
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Container>
  )
}
