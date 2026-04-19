"use client"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import { upsertResellerStoreAction } from "./actions"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { isValidExternalUrl, normalizeStorefrontSettings } from "@/lib/storefront-settings"

type ResellerStore = {
  reseller_id: string
  slug: string
  name: string
  is_published: boolean
  logo_url: string | null
  banner_url: string | null
  primary_color: string | null
  accent_color: string | null
  headline: string | null
  about: string | null
  storefront_settings?: unknown
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function StoreSettingsForm({
  store,
  saved,
  error,
}: {
  store: ResellerStore | null
  saved: boolean
  error: string | null
}) {
  const supabase = useMemo(() => createClient(), [])

  const [name, setName] = useState(store?.name ?? "")
  const [slug, setSlug] = useState(store?.slug ?? "")
  const [headline, setHeadline] = useState(store?.headline ?? "")
  const [about, setAbout] = useState(store?.about ?? "")
  const [primaryColor, setPrimaryColor] = useState(store?.primary_color ?? "#111827")
  const [accentColor, setAccentColor] = useState(store?.accent_color ?? "#fbbf24")
  const [logoUrl, setLogoUrl] = useState(store?.logo_url ?? "")
  const [bannerUrl, setBannerUrl] = useState(store?.banner_url ?? "")
  const [isPublished, setIsPublished] = useState(Boolean(store?.is_published))

  const initialLayout = useMemo(() => normalizeStorefrontSettings(store?.storefront_settings), [store?.storefront_settings])

  const [topbarEnabled, setTopbarEnabled] = useState<boolean>(initialLayout.topbar.enabled)
  const [topbarMessage, setTopbarMessage] = useState<string>(initialLayout.topbar.message)
  const [topbarHomeLabel, setTopbarHomeLabel] = useState<string>(initialLayout.topbar.home_label)
  const [topbarContactLabel, setTopbarContactLabel] = useState<string>(initialLayout.topbar.contact_label)
  const [topbarContactTarget, setTopbarContactTarget] = useState<"anchor" | "external">(initialLayout.topbar.contact_target)
  const [topbarContactUrl, setTopbarContactUrl] = useState<string>(initialLayout.topbar.contact_url)

  const [launchesTitle, setLaunchesTitle] = useState<string>(initialLayout.sections.launches_title)
  const [bestSellersTitle, setBestSellersTitle] = useState<string>(initialLayout.sections.best_sellers_title)
  const [launchesCount, setLaunchesCount] = useState<number>(initialLayout.sections.launches_count)
  const [bestSellersEnabled, setBestSellersEnabled] = useState<boolean>(initialLayout.sections.best_sellers_enabled)
  const [bestSellersCount, setBestSellersCount] = useState<number>(initialLayout.sections.best_sellers_count)

  const [showSizes, setShowSizes] = useState<boolean>(initialLayout.product_card.show_sizes)
  const [sizesText, setSizesText] = useState<string>(initialLayout.product_card.sizes_text)
  const [lookLabel, setLookLabel] = useState<string>(initialLayout.product_card.look_label)
  const [buyLabel, setBuyLabel] = useState<string>(initialLayout.product_card.buy_label)

  const [layoutError, setLayoutError] = useState<string | null>(null)

  const storefrontSettingsJson = useMemo(() => {
    const settings = normalizeStorefrontSettings({
      topbar: {
        enabled: topbarEnabled,
        message: topbarMessage,
        home_label: topbarHomeLabel,
        contact_label: topbarContactLabel,
        contact_target: topbarContactTarget,
        contact_url: topbarContactUrl,
      },
      sections: {
        launches_title: launchesTitle,
        best_sellers_title: bestSellersTitle,
        launches_count: launchesCount,
        best_sellers_enabled: bestSellersEnabled,
        best_sellers_count: bestSellersCount,
      },
      product_card: {
        show_sizes: showSizes,
        sizes_text: sizesText,
        look_label: lookLabel,
        buy_label: buyLabel,
      },
    })
    return JSON.stringify(settings)
  }, [
    topbarEnabled,
    topbarMessage,
    topbarHomeLabel,
    topbarContactLabel,
    topbarContactTarget,
    topbarContactUrl,
    launchesTitle,
    bestSellersTitle,
    launchesCount,
    bestSellersEnabled,
    bestSellersCount,
    showSizes,
    sizesText,
    lookLabel,
    buyLabel,
  ])

  const [uploading, setUploading] = useState<null | "logo" | "banner">(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const publicUrl = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : ""
    const effectiveSlug = (slug || slugify(name)).trim()
    if (!base || !effectiveSlug) return null
    return `${base}/loja/${effectiveSlug}`
  }, [name, slug])

  const errorMessage = useMemo(() => {
    if (!error) return null
    if (error === "missing_name") return "Informe o nome da loja."
    if (error === "missing_slug") return "Informe um slug válido."
    if (error === "slug_taken") return "Esse slug já está em uso. Escolha outro."
    if (error === "invalid_storefront_settings") return "Layout da vitrine inválido. Revise os campos e tente novamente."
    if (error === "invalid_contact_url") return "Informe uma URL externa válida (http/https) para o Fale conosco."
    if (error === "save_failed") return "Não foi possível salvar. Tente novamente."
    return "Não foi possível salvar. Tente novamente."
  }, [error])

  async function uploadToBrandingBucket(file: File, kind: "logo" | "banner") {
    setUploadError(null)
    setUploading(kind)

    const maxSize = kind === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(kind === "logo" ? "Logo excede 2MB." : "Banner excede 5MB.")
      setUploading(null)
      return
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${kind}_${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`
    const filePath = `brand/${fileName}`

    const { data, error: uploadError } = await supabase.storage
      .from("store-branding")
      .upload(filePath, file, { upsert: false })

    if (uploadError) {
      setUploadError(uploadError.message)
      setUploading(null)
      return
    }

    const { data: publicData } = supabase.storage.from("store-branding").getPublicUrl(data.path)
    if (kind === "logo") {
      setLogoUrl(publicData.publicUrl)
    } else {
      setBannerUrl(publicData.publicUrl)
    }

    setUploading(null)
    if (kind === "logo" && logoInputRef.current) logoInputRef.current.value = ""
    if (kind === "banner" && bannerInputRef.current) bannerInputRef.current.value = ""
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-5xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Loja</h2>
          <p className="text-muted-foreground mt-1">Configure sua vitrine, branding e publicação.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/reseller/store/catalog">Gerenciar Catálogo</Link>
          </Button>
          {publicUrl && isPublished && (
            <Button asChild>
              <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
                Ver Loja
              </Link>
            </Button>
          )}
        </div>
      </div>

      {(saved || errorMessage || uploadError) && (
        <div
          className={
            saved
              ? "rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600"
              : "rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
          }
          role={saved ? "status" : "alert"}
          aria-live="polite"
        >
          {saved ? "Configurações salvas com sucesso." : (errorMessage || uploadError)}
        </div>
      )}

      <form
        action={upsertResellerStoreAction}
        className="grid grid-cols-1 gap-6"
        onSubmit={(e) => {
          setLayoutError(null)
          if (!launchesTitle.trim()) {
            e.preventDefault()
            setLayoutError("Informe o título de LANÇAMENTOS.")
            return
          }
          if (!lookLabel.trim()) {
            e.preventDefault()
            setLayoutError("Informe o label do CTA “Olhar”.")
            return
          }
          if (!buyLabel.trim()) {
            e.preventDefault()
            setLayoutError("Informe o label do CTA “Comprar”.")
            return
          }
          if (topbarEnabled && topbarContactTarget === "external") {
            const url = topbarContactUrl.trim()
            if (!url || !isValidExternalUrl(url)) {
              e.preventDefault()
              setLayoutError("Informe uma URL externa válida (http/https) para o Fale conosco.")
            }
          }
        }}
      >
        <input type="hidden" name="storefront_settings" value={storefrontSettingsJson} />
        <Card>
          <CardHeader>
            <CardTitle>Identidade</CardTitle>
            <CardDescription>Nome, URL e informações públicas da sua loja.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Loja</Label>
              <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder={slugify(name) || "minha-loja"}
              />
              {publicUrl && (
                <p className="text-xs text-muted-foreground">
                  URL pública: <span className="font-medium">{publicUrl}</span>
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="headline">Frase de Destaque</Label>
              <Input id="headline" name="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="about">Sobre</Label>
              <Textarea id="about" name="about" value={about} onChange={(e) => setAbout(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Logo, banner e cores. Você pode enviar arquivo ou colar URL externa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Logo</Label>
                <div className="flex gap-2">
                  <Input
                    name="logo_url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <Input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="max-w-[170px] cursor-pointer"
                    disabled={uploading !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadToBrandingBucket(file, "logo")
                    }}
                  />
                </div>
                {logoUrl && (
                  <div className="h-14 w-14 rounded-md border overflow-hidden bg-muted">
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Banner</Label>
                <div className="flex gap-2">
                  <Input
                    name="banner_url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <Input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="max-w-[170px] cursor-pointer"
                    disabled={uploading !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadToBrandingBucket(file, "banner")
                    }}
                  />
                </div>
                {bannerUrl && (
                  <div className="h-14 w-full rounded-md border overflow-hidden bg-muted">
                    <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="primary_color">Cor Primária</Label>
                <Input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accent_color">Cor de Destaque</Label>
                <Input
                  id="accent_color"
                  name="accent_color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout da Vitrine</CardTitle>
            <CardDescription>Controle topbar, títulos, seções e CTAs exibidos na loja pública.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {layoutError && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600" role="alert" aria-live="polite">
                {layoutError}
              </div>
            )}

            <div className="space-y-4">
              <div className="text-sm font-semibold">Topbar</div>
              <div className="flex items-center gap-3">
                <Checkbox checked={topbarEnabled} onCheckedChange={(v) => setTopbarEnabled(Boolean(v))} />
                <span className="text-sm">Exibir topbar</span>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="topbar_message">Mensagem</Label>
                <Input
                  id="topbar_message"
                  value={topbarMessage}
                  onChange={(e) => setTopbarMessage(e.target.value)}
                  disabled={!topbarEnabled}
                  placeholder="Entrega em todo o Brasil • Compre com segurança"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="topbar_home_label">Label do link “Home”</Label>
                  <Input
                    id="topbar_home_label"
                    value={topbarHomeLabel}
                    onChange={(e) => setTopbarHomeLabel(e.target.value)}
                    disabled={!topbarEnabled}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="topbar_contact_label">Label do link “Fale conosco”</Label>
                  <Input
                    id="topbar_contact_label"
                    value={topbarContactLabel}
                    onChange={(e) => setTopbarContactLabel(e.target.value)}
                    disabled={!topbarEnabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="topbar_contact_target">Destino do “Fale conosco”</Label>
                  <select
                    id="topbar_contact_target"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={topbarContactTarget}
                    onChange={(e) => setTopbarContactTarget(e.target.value === "external" ? "external" : "anchor")}
                    disabled={!topbarEnabled}
                  >
                    <option value="anchor">Âncora (#contato)</option>
                    <option value="external">URL externa</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="topbar_contact_url">URL externa</Label>
                  <Input
                    id="topbar_contact_url"
                    value={topbarContactUrl}
                    onChange={(e) => setTopbarContactUrl(e.target.value)}
                    disabled={!topbarEnabled || topbarContactTarget !== "external"}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold">Seções</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="launches_title">Título “LANÇAMENTOS”</Label>
                  <Input id="launches_title" value={launchesTitle} onChange={(e) => setLaunchesTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="launches_count">Quantidade em “LANÇAMENTOS”</Label>
                  <Input
                    id="launches_count"
                    type="number"
                    min={1}
                    max={24}
                    value={launchesCount}
                    onChange={(e) => setLaunchesCount(Math.min(Math.max(Number(e.target.value || "8"), 1), 24))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox checked={bestSellersEnabled} onCheckedChange={(v) => setBestSellersEnabled(Boolean(v))} />
                <span className="text-sm">Exibir “MAIS VENDIDOS”</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="best_sellers_title">Título “MAIS VENDIDOS”</Label>
                  <Input
                    id="best_sellers_title"
                    value={bestSellersTitle}
                    onChange={(e) => setBestSellersTitle(e.target.value)}
                    disabled={!bestSellersEnabled}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="best_sellers_count">Quantidade em “MAIS VENDIDOS”</Label>
                  <Input
                    id="best_sellers_count"
                    type="number"
                    min={1}
                    max={24}
                    value={bestSellersCount}
                    onChange={(e) => setBestSellersCount(Math.min(Math.max(Number(e.target.value || "8"), 1), 24))}
                    disabled={!bestSellersEnabled}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold">Card do Produto</div>

              <div className="flex items-center gap-3">
                <Checkbox checked={showSizes} onCheckedChange={(v) => setShowSizes(Boolean(v))} />
                <span className="text-sm">Exibir linha de tamanhos</span>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sizes_text">Texto da linha de tamanhos</Label>
                <Input
                  id="sizes_text"
                  value={sizesText}
                  onChange={(e) => setSizesText(e.target.value)}
                  disabled={!showSizes}
                  placeholder="P  M  G  GG"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="look_label">Label do CTA “Olhar”</Label>
                  <Input id="look_label" value={lookLabel} onChange={(e) => setLookLabel(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="buy_label">Label do CTA “Comprar”</Label>
                  <Input id="buy_label" value={buyLabel} onChange={(e) => setBuyLabel(e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publicação</CardTitle>
            <CardDescription>Controle se sua loja está visível publicamente.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">{isPublished ? "Loja publicada" : "Loja em rascunho"}</p>
              <p className="text-sm text-muted-foreground">
                {isPublished ? "Clientes podem acessar sua loja pela URL." : "A URL pública não ficará acessível."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input type="hidden" name="is_published" value={String(isPublished)} />
              <Button
                type="button"
                variant={isPublished ? "secondary" : "default"}
                onClick={() => setIsPublished((v) => !v)}
              >
                {isPublished ? "Despublicar" : "Publicar"}
              </Button>
              <Button type="submit" disabled={uploading !== null}>
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
