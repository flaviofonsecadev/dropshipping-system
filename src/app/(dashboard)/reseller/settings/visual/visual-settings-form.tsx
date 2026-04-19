"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/utils/supabase/client"
import { saveVisualSettingsAction } from "./actions"
import { normalizeStorefrontSettings } from "@/lib/storefront-settings"
import { normalizeVisualSettings, type VisualBanner } from "@/lib/visual-settings"
import { ArrowDown, ArrowUp, Image as ImageIcon, Layout, LayoutGrid, Megaphone, Plus, Save, Search, Trash } from "lucide-react"

type ResellerStoreRow = {
  reseller_id: string
  slug: string
  name: string
  is_published: boolean
  logo_url: string | null
  banner_url: string | null
  storefront_settings?: unknown
  visual_settings?: unknown
}

function newId(prefix: string) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? (crypto as Crypto).randomUUID() : Math.random().toString(36).slice(2)
  return `${prefix}_${id}`
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(Math.max(Math.trunc(n), min), max)
}

function moveItem<T>(arr: T[], from: number, to: number) {
  if (from === to) return arr
  if (to < 0 || to >= arr.length) return arr
  const copy = arr.slice()
  const [it] = copy.splice(from, 1)
  copy.splice(to, 0, it)
  return copy
}

async function uploadToBrandingBucket(supabase: ReturnType<typeof createClient>, file: File, folder: string) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { data, error } = await supabase.storage.from("store-branding").upload(filePath, file, { upsert: false })
  if (error) throw error
  const { data: publicData } = supabase.storage.from("store-branding").getPublicUrl(data.path)
  return publicData.publicUrl
}

function BannerEditor({
  item,
  index,
  total,
  kind,
  uploading,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpload,
}: {
  item: VisualBanner
  index: number
  total: number
  kind: "hero" | "promo"
  uploading: string | null
  onChange: (next: VisualBanner) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadKey = `${kind}:${item.id}`
  const isUploading = uploading === uploadKey

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-4 p-4 border rounded-lg bg-card">
      <div className="w-full md:w-56">
        <div className="aspect-[16/7] w-full bg-muted rounded overflow-hidden border flex items-center justify-center">
          {item.image_url ? <img src={item.image_url} alt={item.title ?? "Banner"} className="h-full w-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => {
              fileRef.current?.click()
            }}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Enviar imagem
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
              if (fileRef.current) fileRef.current.value = ""
            }}
          />
        </div>
      </div>

      <div className="flex-1 grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Checkbox checked={item.enabled} onCheckedChange={(v) => onChange({ ...item, enabled: Boolean(v) })} />
            <div className="text-sm font-medium">{kind === "hero" ? "Banner do Hero" : "Banner Promocional"} #{index + 1}</div>
          </div>

          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={onMoveUp} aria-label="Mover para cima">
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={index === total - 1} onClick={onMoveDown} aria-label="Mover para baixo">
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={onRemove} aria-label="Remover">
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Título (opcional)</Label>
          <Input value={item.title ?? ""} onChange={(e) => onChange({ ...item, title: e.target.value || null })} placeholder="Ex: Coleção de Verão" />
        </div>

        <div className="grid gap-2">
          <Label>URL da imagem</Label>
          <Input value={item.image_url} onChange={(e) => onChange({ ...item, image_url: e.target.value })} placeholder="https://..." />
        </div>

        <div className="grid gap-2">
          <Label>Link (opcional)</Label>
          <Input value={item.link_url ?? ""} onChange={(e) => onChange({ ...item, link_url: e.target.value || null })} placeholder="https://... ou /rota" />
        </div>
      </div>
    </div>
  )
}

export function VisualSettingsForm({
  store,
  saved,
  error,
}: {
  store: ResellerStoreRow | null
  saved: boolean
  error: string | null
}) {
  const supabase = useMemo(() => createClient(), [])

  const [activeTab, setActiveTab] = useState<"blocos" | "seo">("blocos")
  const [bannerError, setBannerError] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  const initialSections = useMemo(() => normalizeStorefrontSettings(store?.storefront_settings).sections, [store?.storefront_settings])
  const initialVisual = useMemo(() => normalizeVisualSettings(store?.visual_settings), [store?.visual_settings])

  const [launchesTitle, setLaunchesTitle] = useState(initialSections.launches_title)
  const [launchesCount, setLaunchesCount] = useState(initialSections.launches_count)
  const [bestEnabled, setBestEnabled] = useState(initialSections.best_sellers_enabled)
  const [bestTitle, setBestTitle] = useState(initialSections.best_sellers_title)
  const [bestCount, setBestCount] = useState(initialSections.best_sellers_count)

  const [heroItems, setHeroItems] = useState<VisualBanner[]>(initialVisual.hero.items)
  const [promoItems, setPromoItems] = useState<VisualBanner[]>(initialVisual.promos.items)

  const [metaTitle, setMetaTitle] = useState<string>(initialVisual.seo.meta_title ?? "")
  const [metaDescription, setMetaDescription] = useState<string>(initialVisual.seo.meta_description ?? "")
  const [metaKeywords, setMetaKeywords] = useState<string>(initialVisual.seo.meta_keywords ?? "")
  const [gaId, setGaId] = useState<string>(initialVisual.seo.google_analytics_id ?? "")

  const publicUrl = useMemo(() => {
    if (!store?.slug) return null
    if (typeof window === "undefined") return null
    return `${window.location.origin}/loja/${store.slug}`
  }, [store?.slug])

  const errorMessage = useMemo(() => {
    if (!error) return null
    if (error === "invalid_visual_settings") return "Visual inválido. Tente salvar novamente."
    if (error === "invalid_storefront_sections") return "Seções inválidas. Revise os campos e tente novamente."
    if (error === "save_failed") return "Não foi possível salvar. Tente novamente."
    return "Não foi possível salvar. Tente novamente."
  }, [error])

  const storefrontSectionsJson = useMemo(() => {
    return JSON.stringify({
      launches_title: launchesTitle,
      launches_count: launchesCount,
      best_sellers_enabled: bestEnabled,
      best_sellers_title: bestTitle,
      best_sellers_count: bestCount,
    })
  }, [launchesTitle, launchesCount, bestEnabled, bestTitle, bestCount])

  const visualSettingsJson = useMemo(() => {
    return JSON.stringify(
      normalizeVisualSettings({
        hero: { items: heroItems },
        promos: { items: promoItems },
        seo: {
          meta_title: metaTitle,
          meta_description: metaDescription,
          meta_keywords: metaKeywords,
          google_analytics_id: gaId,
        },
      })
    )
  }, [heroItems, promoItems, metaTitle, metaDescription, metaKeywords, gaId])

  function validateBeforeSubmit() {
    setBannerError(null)

    const heroCount = heroItems.filter((i) => i.enabled && i.image_url.trim()).length
    const promoCount = promoItems.filter((i) => i.enabled && i.image_url.trim()).length

    if (heroItems.length > 8 || promoItems.length > 8) {
      setBannerError("O limite é 8 banners por seção.")
      return false
    }
    if (heroCount === 0 && promoCount === 0 && !metaTitle.trim() && !metaDescription.trim()) {
      return true
    }
    return true
  }

  async function handleUpload(kind: "hero" | "promo", id: string, file: File) {
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setBannerError("Imagem excede 5MB.")
      return
    }

    const key = `${kind}:${id}`
    setUploading(key)
    setBannerError(null)
    try {
      const url = await uploadToBrandingBucket(supabase, file, "visual")
      if (kind === "hero") {
        setHeroItems((prev) => prev.map((it) => (it.id === id ? { ...it, image_url: url } : it)))
      } else {
        setPromoItems((prev) => prev.map((it) => (it.id === id ? { ...it, image_url: url } : it)))
      }
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : "Falha no upload.")
    } finally {
      setUploading(null)
    }
  }

  if (!store) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        <div className="rounded-md border border-border bg-card p-6">
          <div className="text-lg font-semibold">Configure sua loja primeiro</div>
          <div className="text-sm text-muted-foreground mt-1">Crie sua loja e defina um slug antes de personalizar o visual.</div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/reseller/store/settings">Ir para Loja</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form
      action={saveVisualSettingsAction}
      className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full"
      onSubmit={(e) => {
        if (!validateBeforeSubmit()) e.preventDefault()
      }}
    >
      <input type="hidden" name="visual_settings" value={visualSettingsJson} />
      <input type="hidden" name="storefront_sections" value={storefrontSectionsJson} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Visual da Loja</h2>
          <p className="text-muted-foreground mt-1">Gerencie a aparência, os blocos da página e o SEO da sua vitrine.</p>
        </div>
        <div className="flex items-center gap-2">
          {publicUrl && store.is_published && (
            <Button variant="outline" asChild>
              <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
                Ver Loja
              </Link>
            </Button>
          )}
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Salvar Visual
          </Button>
        </div>
      </div>

      {(saved || errorMessage || bannerError) && (
        <div
          className={
            saved
              ? "rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600"
              : "rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
          }
          role={saved ? "status" : "alert"}
          aria-live="polite"
        >
          {saved ? "Visual salvo com sucesso." : (bannerError || errorMessage)}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v === "seo" ? "seo" : "blocos")} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 justify-start mb-6 bg-transparent">
          <TabsTrigger
            value="blocos"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md"
          >
            <Layout className="w-4 h-4 mr-2" />
            Blocos da Página
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md"
          >
            <Search className="w-4 h-4 mr-2" />
            Configurações de SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocos" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Hero Slider
                  </CardTitle>
                  <CardDescription>Gerencie os banners principais exibidos no topo da sua loja.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={heroItems.length >= 8}
                  onClick={() => {
                    setHeroItems((prev) => [
                      ...prev,
                      { id: newId("hero"), image_url: "", link_url: null, title: null, enabled: true, order: prev.length },
                    ])
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {heroItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">Nenhum banner configurado.</div>
              ) : (
                heroItems.map((it, idx) => (
                  <BannerEditor
                    key={it.id}
                    item={it}
                    index={idx}
                    total={heroItems.length}
                    kind="hero"
                    uploading={uploading}
                    onChange={(next) => setHeroItems((prev) => prev.map((p) => (p.id === it.id ? { ...next, order: idx } : p)))}
                    onRemove={() => setHeroItems((prev) => prev.filter((p) => p.id !== it.id).map((p, i) => ({ ...p, order: i })))}
                    onMoveUp={() => setHeroItems((prev) => moveItem(prev, idx, idx - 1).map((p, i) => ({ ...p, order: i })))}
                    onMoveDown={() => setHeroItems((prev) => moveItem(prev, idx, idx + 1).map((p, i) => ({ ...p, order: i })))}
                    onUpload={(file) => handleUpload("hero", it.id, file)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                Grid de Produtos
              </CardTitle>
              <CardDescription>Ajuste títulos e quantidade de produtos nas seções da home.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="launches_title">Título de Lançamentos</Label>
                  <Input id="launches_title" value={launchesTitle} onChange={(e) => setLaunchesTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="launches_count">Qtd. em Lançamentos</Label>
                  <Input
                    id="launches_count"
                    type="number"
                    min={1}
                    max={24}
                    value={launchesCount}
                    onChange={(e) => setLaunchesCount(clampInt(Number(e.target.value || "8"), 1, 24))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox checked={bestEnabled} onCheckedChange={(v) => setBestEnabled(Boolean(v))} />
                <span className="text-sm">Exibir “Mais Vendidos”</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="best_title">Título de Mais Vendidos</Label>
                  <Input
                    id="best_title"
                    value={bestTitle}
                    onChange={(e) => setBestTitle(e.target.value)}
                    disabled={!bestEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="best_count">Qtd. em Mais Vendidos</Label>
                  <Input
                    id="best_count"
                    type="number"
                    min={1}
                    max={24}
                    value={bestCount}
                    onChange={(e) => setBestCount(clampInt(Number(e.target.value || "8"), 1, 24))}
                    disabled={!bestEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Banners Promocionais
                  </CardTitle>
                  <CardDescription>Banners secundários exibidos entre as seções de produtos.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={promoItems.length >= 8}
                  onClick={() => {
                    setPromoItems((prev) => [
                      ...prev,
                      { id: newId("promo"), image_url: "", link_url: null, title: null, enabled: true, order: prev.length },
                    ])
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {promoItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">Nenhum banner promocional configurado.</div>
              ) : (
                promoItems.map((it, idx) => (
                  <BannerEditor
                    key={it.id}
                    item={it}
                    index={idx}
                    total={promoItems.length}
                    kind="promo"
                    uploading={uploading}
                    onChange={(next) => setPromoItems((prev) => prev.map((p) => (p.id === it.id ? { ...next, order: idx } : p)))}
                    onRemove={() => setPromoItems((prev) => prev.filter((p) => p.id !== it.id).map((p, i) => ({ ...p, order: i })))}
                    onMoveUp={() => setPromoItems((prev) => moveItem(prev, idx, idx - 1).map((p, i) => ({ ...p, order: i })))}
                    onMoveDown={() => setPromoItems((prev) => moveItem(prev, idx, idx + 1).map((p, i) => ({ ...p, order: i })))}
                    onUpload={(file) => handleUpload("promo", it.id, file)}
                  />
                ))
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-4">
              <Button type="submit" className="ml-auto">
                Salvar Visual
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de SEO</CardTitle>
              <CardDescription>Otimize sua loja para motores de busca.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-3xl">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Título da Página Inicial (Meta Title)</Label>
                  <Input id="seo-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={`Ex: ${store.name} - Promoções e novidades`} />
                  <p className="text-[11px] text-muted-foreground">Recomendado: entre 50 e 60 caracteres.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-description">Descrição da Loja (Meta Description)</Label>
                  <Textarea
                    id="seo-description"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Escreva um breve resumo sobre o que sua loja oferece. Isso aparecerá nos resultados de busca."
                  />
                  <p className="text-[11px] text-muted-foreground">Recomendado: entre 150 e 160 caracteres.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-keywords">Palavras-chave (Keywords)</Label>
                  <Input
                    id="seo-keywords"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="roupas, moda, verão (separadas por vírgula)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ga-id">ID do Google Analytics</Label>
                  <Input id="ga-id" value={gaId} onChange={(e) => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t py-4">
              <Button type="submit" className="ml-auto">
                Salvar Configurações de SEO
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}

