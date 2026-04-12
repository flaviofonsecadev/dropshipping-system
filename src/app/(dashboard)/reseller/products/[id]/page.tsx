import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Image as ImageIcon, Video as VideoIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ResellerImportForm } from "@/components/products/reseller-import-form"

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  // No Next.js 15+, params é uma promise e precisa do await
  const resolvedParams = await params

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!product) {
    notFound()
  }

  const images = product.images || []
  const videos = product.videos || []

  // Componente simples para embedar video dependendo da origem
  const renderVideo = (url: string) => {
    // Se for youtube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]
      return (
        <iframe 
          className="w-full aspect-video rounded-md" 
          src={`https://www.youtube.com/embed/${videoId}`} 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      )
    }
    
    // Se for tiktok
    if (url.includes('tiktok.com')) {
      // Extrair o ID do vídeo (normalmente está no formato: https://www.tiktok.com/@user/video/1234567890123456789)
      const videoIdMatch = url.match(/\/video\/(\d+)/)
      const videoId = videoIdMatch ? videoIdMatch[1] : null
      
      if (videoId) {
        return (
          <iframe
            className="w-full aspect-[9/16] max-h-[600px] mx-auto rounded-md"
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            allow="encrypted-media;"
            allowFullScreen
          ></iframe>
        )
      } else {
        // Fallback caso seja um link curto ou diferente, tentaremos renderizar um link para abrir fora
        return (
          <div className="w-full aspect-video bg-muted rounded-md flex flex-col items-center justify-center p-4 text-center">
            <VideoIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-2">Vídeo do TikTok</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
              Abrir no TikTok
            </a>
          </div>
        )
      }
    }
    
    // Se for video do storage (ou link direto mp4)
    return (
      <video className="w-full aspect-video rounded-md" controls>
        <source src={url} />
        Seu navegador não suporta a tag de vídeo.
      </video>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reseller/products">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Produto</h2>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* COLUNA ESQUERDA: MÍDIAS */}
        <div className="space-y-4">
          {/* Capa e Imagens */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Galeria de Imagens
              </h3>
              
              {images.length > 0 ? (
                <div className="space-y-4">
                  {/* Capa Maior */}
                  <div className="aspect-square bg-muted rounded-md overflow-hidden border">
                    <img src={images[0]} alt="Capa" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(1).map((img: string, i: number) => (
                        <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden border">
                          <img src={img} alt={`Foto ${i + 2}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-muted rounded-md flex items-center justify-center border text-muted-foreground">
                  Sem imagens
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vídeo */}
          {videos.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <VideoIcon className="w-4 h-4" /> Vídeo do Produto
                </h3>
                {renderVideo(videos[0])}
              </CardContent>
            </Card>
          )}
        </div>

        {/* COLUNA DIREITA: INFORMAÇÕES */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase">SKU</h4>
                <p className="text-lg font-semibold">{product.sku}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase">Descrição</h4>
                <p className="text-base whitespace-pre-wrap">{product.description || "Sem descrição."}</p>
              </div>
              
              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase">Custo Base</h4>
                  <p className="text-xl font-bold">R$ {Number(product.base_cost).toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase">Margem Sugerida</h4>
                  <p className="text-xl font-bold text-green-600">R$ {Number(product.suggested_margin).toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase">Estoque Disponível</h4>
                  <p className="text-lg">{product.stock_quantity} un.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Informações de Frete</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">Peso</h4>
                  <p className="text-sm">{product.weight_kg} kg</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">Compr.</h4>
                  <p className="text-sm">{product.length_cm} cm</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">Largura</h4>
                  <p className="text-sm">{product.width_cm} cm</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">Altura</h4>
                  <p className="text-sm">{product.height_cm} cm</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* COMPONENTE DE IMPORTAÇÃO PARA O REVENDEDOR */}
          <ResellerImportForm 
            productId={product.id} 
            baseCost={Number(product.base_cost)} 
            suggestedMargin={Number(product.suggested_margin)} 
          />
        </div>
      </div>
    </div>
  )
}