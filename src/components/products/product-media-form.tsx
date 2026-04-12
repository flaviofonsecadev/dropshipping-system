"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon, Video, X, Link as LinkIcon } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

interface ProductMediaFormProps {
  images: string[]
  setImages: (images: string[]) => void
  videos: string[]
  setVideos: (videos: string[]) => void
}

export function ProductMediaForm({ images, setImages, videos, setVideos }: ProductMediaFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [videoUrlInput, setVideoUrlInput] = useState("")

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return
    if (images.length >= 5) {
      setError("Máximo de 5 imagens permitido.")
      return
    }
    setImages([...images, imageUrlInput.trim()])
    setImageUrlInput("")
    setError(null)
  }

  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return
    if (videos.length >= 1) {
      setError("Máximo de 1 vídeo permitido.")
      return
    }
    setVideos([...videos, videoUrlInput.trim()])
    setVideoUrlInput("")
    setError(null)
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const handleRemoveVideo = (index: number) => {
    const newVideos = [...videos]
    newVideos.splice(index, 1)
    setVideos(newVideos)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      setError("Máximo de 5 imagens permitido.")
      return
    }

    setIsUploading(true)
    setError(null)

    const newImages = [...images]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 2 * 1024 * 1024) {
        setError(`A imagem ${file.name} excede o limite de 2MB.`)
        continue
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `images/${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from('product-media')
        .upload(filePath, file)

      if (uploadError) {
        setError(`Erro ao fazer upload da imagem ${file.name}: ${uploadError.message}`)
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('product-media')
          .getPublicUrl(data.path)
        newImages.push(publicUrlData.publicUrl)
      }
    }

    setImages(newImages)
    setIsUploading(false)
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (videos.length >= 1) {
      setError("Máximo de 1 vídeo permitido.")
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setError(`O vídeo ${file.name} excede o limite de 15MB.`)
      return
    }

    setIsUploading(true)
    setError(null)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `videos/${fileName}`

    const { data, error: uploadError } = await supabase.storage
      .from('product-media')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Erro ao fazer upload do vídeo: ${uploadError.message}`)
    } else if (data) {
      const { data: publicUrlData } = supabase.storage
        .from('product-media')
        .getPublicUrl(data.path)
      setVideos([...videos, publicUrlData.publicUrl])
    }

    setIsUploading(false)
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
      
      {/* IMAGENS */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> Imagens do Produto
          </h3>
          <p className="text-sm text-muted-foreground">
            Adicione até 5 imagens. Você pode fazer upload (máx 2MB) ou colar o link externo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <Label>Upload de Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload} 
                  disabled={isUploading || images.length >= 5}
                  ref={imageInputRef}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <Label>Link Externo</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://exemplo.com/imagem.jpg" 
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  disabled={images.length >= 5}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddImageUrl()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddImageUrl} 
                  disabled={images.length >= 5 || !imageUrlInput.trim()}
                  variant="secondary"
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PREVIEW IMAGENS */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border group">
                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="w-6 h-6 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1">
                    Capa
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VÍDEO */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Video className="w-5 h-5" /> Vídeo do Produto (Opcional)
          </h3>
          <p className="text-sm text-muted-foreground">
            Adicione 1 vídeo demonstrativo. Upload (máx 15MB) ou link do YouTube/Vimeo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <Label>Upload de Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoUpload} 
                  disabled={isUploading || videos.length >= 1}
                  ref={videoInputRef}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <Label>Link Externo (YouTube, etc)</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://youtube.com/watch?v=..." 
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  disabled={videos.length >= 1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddVideoUrl()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddVideoUrl} 
                  disabled={videos.length >= 1 || !videoUrlInput.trim()}
                  variant="secondary"
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PREVIEW VÍDEO */}
        {videos.length > 0 && (
          <div className="mt-4">
            {videos.map((url, index) => (
              <div key={index} className="relative rounded-md overflow-hidden border inline-block group">
                <div className="p-2 pr-10 bg-zinc-100 dark:bg-zinc-800 text-sm truncate max-w-[300px]">
                  {url}
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-2">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="w-6 h-6 rounded-full"
                    onClick={() => handleRemoveVideo(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
