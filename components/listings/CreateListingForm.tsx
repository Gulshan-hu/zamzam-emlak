"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/listings/ImageUpload";
import { MapPicker } from "@/components/listings/MapPicker";
import { CheckCircle2, Circle } from "lucide-react";
import type { UserRole } from "@/lib/types";

type CreateListingFormProps = {
  userId: string;
  userRole: UserRole;
  agencyId: string | null;
};

type FormData = {
  // Step 1: Basic Info
  title: string;
  description: string;
  type: "SALE" | "RENT" | "";
  category: "APARTMENT" | "HOUSE" | "LAND" | "COMMERCIAL" | "";
  price: string;

  // Step 2: Details
  area: string;
  rooms: string;
  floor: string;
  totalFloors: string;

  // Step 3: Location
  address: string;
  district: string;
  city: string;
  lat: number | null;
  lng: number | null;

  // Step 4: Contact
  phone: string;
  email: string;
};

const INITIAL_FORM_DATA: FormData = {
  title: "",
  description: "",
  type: "",
  category: "",
  price: "",
  area: "",
  rooms: "",
  floor: "",
  totalFloors: "",
  address: "",
  district: "",
  city: "",
  lat: null,
  lng: null,
  phone: "",
  email: "",
};

const TYPES = [
  { value: "", label: "Növ seçin" },
  { value: "SALE", label: "Satış" },
  { value: "RENT", label: "Kirayə" },
];

const CATEGORIES = [
  { value: "", label: "Kateqoriya seçin" },
  { value: "APARTMENT", label: "Mənzil" },
  { value: "HOUSE", label: "Ev/Villa" },
  { value: "LAND", label: "Torpaq" },
  { value: "COMMERCIAL", label: "Kommersiya" },
];

const CITIES = [
  { value: "", label: "Şəhər seçin" },
  { value: "Bakı", label: "Bakı" },
  { value: "Gəncə", label: "Gəncə" },
  { value: "Sumqayıt", label: "Sumqayıt" },
  { value: "Mingəçevir", label: "Mingəçevir" },
  { value: "Qusar", label: "Qusar" },
  { value: "Şəki", label: "Şəki" },
  { value: "Lənkəran", label: "Lənkəran" },
  { value: "Quba", label: "Quba" },
  { value: "Şamaxı", label: "Şamaxı" },
  { value: "Qəbələ", label: "Qəbələ" },
  { value: "Xaçmaz", label: "Xaçmaz" },
  { value: "Naxçıvan", label: "Naxçıvan" },
];

const STEPS = [
  { id: 1, title: "Əsas məlumat", description: "Başlıq, təsvir, növ" },
  { id: 2, title: "Detallar", description: "Sahə, otaq, mərtəbə" },
  { id: 3, title: "Məkan", description: "Ünvan və xəritə" },
  { id: 4, title: "Şəkillər", description: "Əmlak şəkilləri" },
  { id: 5, title: "Təsdiq", description: "Yoxlama və göndərmə" },
];

export function CreateListingForm({
  userId: _userId,
  userRole: _userRole,
  agencyId: _agencyId,
}: CreateListingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Check agency quota when auth is configured
  // const [quotaInfo, setQuotaInfo] = useState<{
  //   used: number;
  //   total: number;
  // } | null>(null);

  const updateFormData = (field: keyof FormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    switch (step) {
      case 1:
        if (!formData.title || formData.title.length < 10) {
          setError("Başlıq ən azı 10 simvol olmalıdır");
          return false;
        }
        if (!formData.description || formData.description.length < 50) {
          setError("Təsvir ən azı 50 simvol olmalıdır");
          return false;
        }
        if (!formData.type) {
          setError("Növ seçin");
          return false;
        }
        if (!formData.category) {
          setError("Kateqoriya seçin");
          return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
          setError("Düzgün qiymət daxil edin");
          return false;
        }
        return true;

      case 2:
        if (!formData.area || parseFloat(formData.area) <= 0) {
          setError("Düzgün sahə daxil edin");
          return false;
        }
        if (formData.floor && formData.totalFloors) {
          const floor = parseInt(formData.floor);
          const totalFloors = parseInt(formData.totalFloors);
          if (floor > totalFloors) {
            setError("Mərtəbə ümumi mərtəbədən böyük ola bilməz");
            return false;
          }
        }
        return true;

      case 3:
        if (!formData.address || formData.address.length < 5) {
          setError("Ünvan ən azı 5 simvol olmalıdır");
          return false;
        }
        if (!formData.city) {
          setError("Şəhər seçin");
          return false;
        }
        return true;

      case 4:
        if (images.length === 0) {
          setError("Ən azı 1 şəkil yükləyin");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload images to Supabase Storage
      const imageUrls = await Promise.all(
        images.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to upload image");
          }

          const data = await response.json();
          return data.url;
        })
      );

      // Create listing with uploaded image URLs
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          area: parseFloat(formData.area),
          rooms: formData.rooms ? parseInt(formData.rooms) : null,
          floor: formData.floor ? parseInt(formData.floor) : null,
          totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
          images: imageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create listing");
      }

      // Redirect to listings page
      router.push("/listings?success=created");
    } catch (err) {
      console.error("Failed to create listing:", err);
      setError(err instanceof Error ? err.message : "Elan yaradılarkən xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  currentStep > step.id
                    ? "border-success bg-success text-white"
                    : currentStep === step.id
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-text-muted"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <div className="text-center">
                <p
                  className={`text-xs font-medium ${
                    currentStep >= step.id
                      ? "text-text-primary"
                      : "text-text-muted"
                  }`}
                >
                  {step.title}
                </p>
                <p className="hidden text-xs text-text-muted sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 transition-colors ${
                  currentStep > step.id ? "bg-success" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* Form Steps */}
      <Card className="p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Əsas məlumat
            </h2>

            <Input
              label="Başlıq"
              placeholder="məs: 3 otaqlı mənzil Nəsimi rayonunda"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Təsvir <span className="text-error">*</span>
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={6}
                placeholder="Əmlakın detallarını yazın..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Növ"
                options={TYPES}
                value={formData.type}
                onChange={(e) => updateFormData("type", e.target.value)}
                required
              />

              <Select
                label="Kateqoriya"
                options={CATEGORIES}
                value={formData.category}
                onChange={(e) => updateFormData("category", e.target.value)}
                required
              />
            </div>

            <Input
              label="Qiymət (₼)"
              type="number"
              placeholder="0"
              value={formData.price}
              onChange={(e) => updateFormData("price", e.target.value)}
              required
            />
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Detallar
            </h2>

            <Input
              label="Sahə (m²)"
              type="number"
              placeholder="0"
              value={formData.area}
              onChange={(e) => updateFormData("area", e.target.value)}
              required
            />

            <Input
              label="Otaq sayı"
              type="number"
              placeholder="Məs: 3"
              value={formData.rooms}
              onChange={(e) => updateFormData("rooms", e.target.value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Mərtəbə"
                type="number"
                placeholder="Məs: 5"
                value={formData.floor}
                onChange={(e) => updateFormData("floor", e.target.value)}
              />

              <Input
                label="Ümumi mərtəbə"
                type="number"
                placeholder="Məs: 9"
                value={formData.totalFloors}
                onChange={(e) => updateFormData("totalFloors", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Məkan</h2>

            <Select
              label="Şəhər"
              options={CITIES}
              value={formData.city}
              onChange={(e) => updateFormData("city", e.target.value)}
              required
            />

            <Input
              label="Rayon/Ərazi"
              placeholder="Məs: Nəsimi, 28 May"
              value={formData.district}
              onChange={(e) => updateFormData("district", e.target.value)}
            />

            <Input
              label="Ünvan"
              placeholder="Tam ünvanı daxil edin"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Xəritədə məkanı seçin (ixtiyari)
              </label>
              <MapPicker
                address={formData.address}
                city={formData.city}
                lat={formData.lat}
                lng={formData.lng}
                onLocationChange={(lat, lng) => {
                  updateFormData("lat", lat);
                  updateFormData("lng", lng);
                }}
              />
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Şəkillər
            </h2>

            <ImageUpload images={images} onChange={setImages} maxImages={10} />
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Yoxlama və Təsdiq
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-text-muted">
                  Başlıq
                </h3>
                <p className="text-text-primary">{formData.title}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-text-muted">
                  Təsvir
                </h3>
                <p className="text-sm text-text-primary">
                  {formData.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-text-muted">
                    Növ
                  </h3>
                  <p className="text-text-primary">
                    {formData.type === "SALE" ? "Satış" : "Kirayə"}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-text-muted">
                    Kateqoriya
                  </h3>
                  <p className="text-text-primary">
                    {CATEGORIES.find((c) => c.value === formData.category)
                      ?.label}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-text-muted">
                    Qiymət
                  </h3>
                  <p className="text-text-primary">{formData.price} ₼</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-text-muted">
                    Sahə
                  </h3>
                  <p className="text-text-primary">{formData.area} m²</p>
                </div>

                {formData.rooms && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-text-muted">
                      Otaq sayı
                    </h3>
                    <p className="text-text-primary">{formData.rooms}</p>
                  </div>
                )}

                {formData.floor && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-text-muted">
                      Mərtəbə
                    </h3>
                    <p className="text-text-primary">
                      {formData.floor}
                      {formData.totalFloors && `/${formData.totalFloors}`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-text-muted">
                  Ünvan
                </h3>
                <p className="text-text-primary">
                  {formData.address}
                  {formData.district && `, ${formData.district}`}, {formData.city}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-text-muted">
                  Şəkillər
                </h3>
                <p className="text-text-primary">{images.length} şəkil</p>
              </div>
            </div>

            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-sm text-text-primary">
                Elanınız yaradıldıqdan sonra yoxlama üçün göndəriləcək.
                Təsdiqdən sonra saytda dərc olunacaq.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            Geri
          </Button>

          {currentStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Növbəti
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Göndərilir...
                </>
              ) : (
                "Təsdiq et və göndər"
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
