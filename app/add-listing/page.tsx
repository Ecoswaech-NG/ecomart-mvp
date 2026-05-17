"use client";
// PLACE AT: app/add-listing/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Data from "@/Shared/Data";
import carDetails from "@/Shared/carDetails.json";
import features from "@/Shared/features.json";
import ImagePicker, { LocalImage, MIN_IMAGES } from "./components/ImagePicker";
import ListingPreview from "./components/ListingPreview";
import {
  MdTitle, MdBrandingWatermark, MdDevicesOther,
  MdAttachMoney, MdLocationOn, MdDescription,
} from "react-icons/md";
import { FaCarBattery, FaPlug } from "react-icons/fa";
import { GiElectric } from "react-icons/gi";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage      = "form" | "preview";
type ListingTab = "vehicle" | "charger" | "accessory";
type VehicleForm   = Record<string, string>;
type FeaturesForm  = Record<string, boolean>;

// ─── Option lists ─────────────────────────────────────────────────────────────

const CONNECTOR_TYPES = ["CCS2", "CCS1", "CHAdeMO", "Type 2", "Type 1", "NACS (Tesla)", "GB/T", "Other"];
const CHARGING_KW     = ["3.7kW", "7.4kW", "11kW", "22kW", "50kW", "100kW", "150kW", "250kW+"];
const IP_RATINGS      = ["IP44", "IP54", "IP55", "IP65", "IP66", "IP67", "IP68"];
const VOLTAGES        = ["12V", "24V", "48V", "230V AC", "400V DC", "800V DC", "Other"];
const PHASES          = ["Single Phase", "Three Phase"];
const CHARGER_TYPES   = ["Home Charger", "AC Station", "DC Fast Charger", "Portable Charger"];
const SPECIFICATIONS  = ["CCS2", "CCS1", "CHAdeMO", "Type 2", "Type 1", "NACS", "GB/T"];
const WARRANTIES      = ["No warranty", "3 months", "6 months", "1 year", "2 years", "3 years", "5 years"];

const ACCESSORY_CATEGORIES = [
  "Charging Equipment",
  "Exterior Accessories",
  "Interior Accessories",
  "Safety & Maintenance",
  "Battery Components",
  "Motor & Drivetrain",
  "Power Electronics",
  "Tyres & Wheels",
  "Cables & Adapters",
  "Other",
];
const CONDITIONS       = ["New", "Refurbished", "Used – Like New", "Used – Good", "Used – Fair"];
const CERTIFICATIONS_OPT = ["CE", "FCC", "RoHS", "UL Listed", "IEC 61851", "IEC 62196", "Energy Star", "BSI", "Other"];

const EV_MAKES = ["Tesla", "Nissan", "BMW", "Hyundai", "Kia", "BYD", "Rivian",
                  "Polestar", "Volkswagen", "Audi", "Mercedes", "Ford", "GM",
                  "Volvo", "Lucid", "Fisker", "Universal / All EVs", "Other"];

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "input-field";

const labelCls = "text-sm font-medium text-foreground flex items-center gap-2 mb-1.5";

function Label({ icon, children, required }: {
  icon?: React.ReactNode; children: React.ReactNode; required?: boolean;
}) {
  return (
    <label className={labelCls}>
      {icon && <span className="text-[#00d9d9]">{icon}</span>}
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#00d9d9] uppercase tracking-widest border-b border-gray-100 dark:border-[#2d1e5f] pb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">{children}</h3>;
}

function SelectField({
  label, icon, value, onChange, options, required, placeholder,
}: {
  label: string; icon?: React.ReactNode; value: string;
  onChange: (v: string) => void; options: string[];
  required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <Label icon={icon} required={required}>{label}</Label>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextField({
  label, icon, value, onChange, required, placeholder, type = "text",
}: {
  label: string; icon?: React.ReactNode; value: string;
  onChange: (v: string) => void; required?: boolean;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <Label icon={icon} required={required}>{label}</Label>
      <input
        type={type}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function CheckboxGroup({
  label, options, selected, onChange,
}: {
  label: string; options: string[];
  selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              selected.includes(opt)
                ? "bg-[#00d9d9] text-[#001b4d] border-[#00d9d9] font-semibold"
                : "bg-white dark:bg-[#18122b] text-gray-600 dark:text-[#8b949e] border-gray-200 dark:border-[#2d1e5f] hover:border-[#00d9d9]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleField({
  label, desc, value, onChange,
}: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 dark:border-[#2d1e5f] hover:border-[#7b2ff2]/40 transition-all">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-[#c4b8e8]">{label}</p>
        {desc && <p className="text-xs text-gray-400 dark:text-[#484f58] mt-0.5">{desc}</p>}
      </div>
      <div
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors shrink-0 relative ${
          value ? "bg-[#00d9d9]" : "bg-gray-200 dark:bg-[#21262d]"
        }`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
          value ? "left-5" : "left-0.5"
        }`} />
      </div>
    </label>
  );
}

// ─── Dynamic vehicle form resolver (unchanged from existing) ──────────────────

function resolveOptions(item: any, form: VehicleForm): string[] {
  if (item.options)             return item.options;
  if (item.name === "category") return item.optionsByCategory?.[form.type ?? ""]     ?? [];
  if (item.name === "make")     return item.optionsByCategory?.[form.category ?? ""] ?? [];
  if (item.name === "model")    return item.optionsByMake?.[form.make ?? ""]          ?? [];
  return [];
}

function VehicleField({ item, form, onChange }: {
  item: any; form: VehicleForm; onChange: (name: string, val: string) => void;
}) {
  const options    = resolveOptions(item, form);
  const value      = form[item.name] ?? "";
  const isDisabled =
    (item.name === "category" && !form.type) ||
    (item.name === "make"     && !form.category) ||
    (item.name === "model"    && !form.make);
  const hint =
    item.name === "category" ? "Select a vehicle type first" :
    item.name === "make"     ? "Select a category first" :
    item.name === "model"    ? "Select a make first" : "";

  return (
    <div className={item.fieldType === "textarea" ? "md:col-span-2" : ""}>
      <Label required={item.required}>{item.label}</Label>
      {item.fieldType === "text" || item.fieldType === "number" ? (
        <input type={item.fieldType === "number" ? "number" : "text"} className={inputCls}
          value={value} onChange={(e) => onChange(item.name, e.target.value)} required={item.required} />
      ) : item.fieldType === "dropdown" ? (
        <>
          <select className={`${inputCls} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            value={value} onChange={(e) => onChange(item.name, e.target.value)}
            disabled={isDisabled} required={item.required}>
            <option value="">{isDisabled ? hint : `Select ${item.label}`}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {isDisabled && <p className="text-xs text-amber-400 mt-1">{hint}</p>}
        </>
      ) : item.fieldType === "textarea" ? (
        <textarea className={`${inputCls} min-h-25 resize-y`}
          value={value} onChange={(e) => onChange(item.name, e.target.value)} required={item.required} />
      ) : null}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AddListing() {
  const { user, userLoggedIn } = useAuth();
  const router = useRouter();

  const [stage,     setStage]     = useState<Stage>("form");
  const [activeTab, setActiveTab] = useState<ListingTab>("vehicle");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]  = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Vehicle state ──────────────────────────────────────────────────────────
  const [vehicleForm,  setVehicleForm]  = useState<VehicleForm>({});
  const [featuresForm, setFeaturesForm] = useState<FeaturesForm>({});
  const [localImages,  setLocalImages]  = useState<LocalImage[]>([]);
  const [imageErrors,  setImageErrors]  = useState<string[]>([]);

  const handleVehicleChange = (name: string, value: string) => {
    setVehicleForm((prev) => {
      if (name === "type")     return { ...prev, type: value, category: "", make: "", model: "" };
      if (name === "category") return { ...prev, category: value, make: "", model: "" };
      if (name === "make")     return { ...prev, make: value, model: "" };
      return { ...prev, [name]: value };
    });
  };

  const requiredVehicleFields = [
    "location","type","sellingPrice","category","condition",
    "make","model","year","driveType","range","power","mileage",
    "batterySize","maxSpeed","color","door","listingDescription",
  ];
  const missingFields = requiredVehicleFields.filter((f) => !vehicleForm[f]);
  const canPreview    = missingFields.length === 0 && localImages.length >= MIN_IMAGES;

  // ── Charger state ──────────────────────────────────────────────────────────
  const [chargerImages,   setChargerImages]   = useState<LocalImage[]>([]);
  const [chargerErrors,   setChargerErrors]   = useState<string[]>([]);
  const [charger, setCharger] = useState({
    listingTitle: "", brand: "", model: "", type: "", specification: "",
    power: "", chargingKw: "", voltage: "", ipRating: "", cableLength: "",
    phases: "", warranty: "", price: "", location: "", description: "",
    smartCharging: false, tethered: false, installationRequired: true,
    certifications: [] as string[],
  });

  const setC = (key: string, val: any) => setCharger((p) => ({ ...p, [key]: val }));

  const onSubmitCharger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLoggedIn || !user) { showToast("Sign in required.", false); return; }
    if (chargerImages.length < 3) { showToast("At least 3 photos required for charger listings.", false); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings/chargers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...charger,
          images: chargerImages.map((img) => ({ imageUrl: URL.createObjectURL(img.file) })),
          createdBy: user.email,
          userName:  user.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCharger({
        listingTitle: "", brand: "", model: "", type: "", specification: "",
        power: "", chargingKw: "", voltage: "", ipRating: "", cableLength: "",
        phases: "", warranty: "", price: "", location: "", description: "",
        smartCharging: false, tethered: false, installationRequired: true,
        certifications: [],
      });
      setChargerImages([]);
      showToast("Charger listing posted!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", false);
    } finally { setSubmitting(false); }
  };

  // ── Accessory state ────────────────────────────────────────────────────────
  const [accessoryImages, setAccessoryImages] = useState<LocalImage[]>([]);
  const [accessoryErrors, setAccessoryErrors] = useState<string[]>([]);
  const [accessory, setAccessory] = useState({
    name: "", brand: "", category: "", condition: "New",
    vehicleMake: "", vehicleModel: "", vehicleYear: "", partNumber: "", trimVariant: "",
    voltageRating: "", connectorType: "", chargingKw: "", ipRating: "",
    cableLength: "", weightKg: "", dimensions: "",
    warranty: "", price: "", location: "", description: "",
    installationRequired: false,
    certifications: [] as string[],
  });

  const setA = (key: string, val: any) => setAccessory((p) => ({ ...p, [key]: val }));

  const onSubmitAccessory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLoggedIn || !user) { showToast("Sign in required.", false); return; }
    if (accessoryImages.length < 3) { showToast("At least 3 photos required for accessory listings.", false); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings/accessories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...accessory,
          images: accessoryImages.map((img) => ({ imageUrl: URL.createObjectURL(img.file) })),
          createdBy: user.email,
          userName:  user.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      showToast("Accessory listed!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", false);
    } finally { setSubmitting(false); }
  };

  // ── Preview screen ────────────────────────────────────────────────────────

  if (stage === "preview" && activeTab === "vehicle") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822] px-4 sm:px-10 md:px-20 py-10">
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.ok ? "bg-[#238636]" : "bg-red-500"}`}>
            {toast.msg}
          </div>
        )}
        <ListingPreview
          form={vehicleForm}
          features={featuresForm}
          images={localImages}
          userName={user?.fullName ?? ""}
          userEmail={user?.email ?? ""}
          userId={user?.id ?? ""}
          onEdit={() => setStage("form")}
          onPublished={(id) => {
            showToast("Listing published!");
            router.push(`/listing-details/${id}`);
          }}
          onError={(msg) => {
            showToast(msg, false);
            setStage("form");
          }}
        />
      </div>
    );
  }

  // ── Form screen ───────────────────────────────────────────────────────────

  const tabs: { key: ListingTab; label: string }[] = [
    { key: "vehicle",   label: "🚗 Vehicle"          },
    { key: "charger",   label: "⚡ Charger"           },
    { key: "accessory", label: "🔧 Accessory / Parts" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822] px-4 sm:px-10 md:px-20 py-10">

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.ok ? "bg-[#238636]" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {["Fill Details", "Preview", "Publish"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 0 ? "bg-[#00d9d9] text-[#001b4d] font-semibold" : "bg-gray-200 dark:bg-[#21262d] text-gray-400"
            }`}>{i + 1}</div>
            <span className={`text-xs font-medium hidden sm:block ${i === 0 ? "text-[#00d9d9]" : "text-gray-400"}`}>{s}</span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 dark:bg-[#21262d]" />}
          </div>
        ))}
      </div>

      <h1 className="font-bold text-3xl text-gray-900 dark:text-white mb-1">Add New Listing</h1>
      <p className="text-gray-400 text-sm mb-8">
        Fill in details and select photos, then preview before publishing.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[#00d9d9] text-[#001b4d] shadow font-semibold"
                : "bg-white dark:bg-[#18122b] border border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#c4b8e8] hover:border-[#00d9d9]"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── VEHICLE FORM ────────────────────────────────────────────────────── */}
      {activeTab === "vehicle" && (
        <div className="bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl p-8 space-y-8">
          <div>
            <SectionTitle>Vehicle Details</SectionTitle>
            {vehicleForm.type && (
              <div className="mb-4 text-xs text-[#00d9d9] bg-cyan-50 dark:bg-cyan-900/20 px-4 py-2 rounded-lg">
                {[vehicleForm.type, vehicleForm.category, vehicleForm.make, vehicleForm.model].filter(Boolean).join(" → ")}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(carDetails.carDetails as any[]).map((item, i) => (
                <VehicleField key={i} item={item} form={vehicleForm} onChange={handleVehicleChange} />
              ))}
            </div>
          </div>
          <Separator className="dark:bg-[#2d1e5f]" />
          <div>
            <SectionTitle>Features</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(features.features as any[]).map((item, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-[#c4b8e8]">
                  <Checkbox checked={!!featuresForm[item.name]}
                    onCheckedChange={(val) => setFeaturesForm((p) => ({ ...p, [item.name]: !!val }))} />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
          <Separator className="dark:bg-[#2d1e5f]" />
          <ImagePicker images={localImages} onChange={setLocalImages} errors={imageErrors} onErrors={setImageErrors} />
          <Separator className="dark:bg-[#2d1e5f]" />
          <div className="flex flex-col items-end gap-2">
            {!canPreview && (
              <p className="text-xs text-amber-500 text-right">
                {missingFields.length > 0
                  ? `Complete: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? ` +${missingFields.length - 3} more` : ""}`
                  : `Add ${MIN_IMAGES - localImages.length} more photo${MIN_IMAGES - localImages.length !== 1 ? "s" : ""}`}
              </p>
            )}
            <Button type="button" onClick={() => setStage("preview")} disabled={!canPreview}
              className="bg-linear-to-r from-[#00d9d9] to-[#c946ef] hover:from-[#00c5c5] hover:to-[#b033dd] text-white px-8 rounded-full disabled:opacity-40 font-semibold">
              Preview Listing →
            </Button>
          </div>
        </div>
      )}

      {/* ── CHARGER FORM ────────────────────────────────────────────────────── */}
      {activeTab === "charger" && (
        <form onSubmit={onSubmitCharger} className="bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl p-8 space-y-8">
          <SectionTitle>Charger Listing</SectionTitle>

          {/* Identity */}
          <Section title="Product Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField label="Listing Title" icon={<MdTitle />}
                value={charger.listingTitle} onChange={(v) => setC("listingTitle", v)}
                placeholder="e.g. Mennekes 22kW Smart Charger" />
              <TextField label="Brand" icon={<MdBrandingWatermark />} required
                value={charger.brand} onChange={(v) => setC("brand", v)} placeholder="e.g. Mennekes" />
              <TextField label="Model" icon={<FaCarBattery />} required
                value={charger.model} onChange={(v) => setC("model", v)} placeholder="e.g. AMTRON Compact" />
              <SelectField label="Charger Type" icon={<GiElectric />} required
                value={charger.type} onChange={(v) => setC("type", v)} options={CHARGER_TYPES} />
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Technical specs */}
          <Section title="Technical Specifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="Connector Standard" icon={<FaPlug />} required
                value={charger.specification} onChange={(v) => setC("specification", v)}
                options={SPECIFICATIONS} />
              <TextField label="Power Output (label)" icon={<GiElectric />} required
                value={charger.power} onChange={(v) => setC("power", v)}
                placeholder="e.g. 22kW" />
              <SelectField label="Charging Capacity (kW)" value={charger.chargingKw}
                onChange={(v) => setC("chargingKw", v)} options={CHARGING_KW}
                placeholder="Select capacity" />
              <SelectField label="Voltage" value={charger.voltage}
                onChange={(v) => setC("voltage", v)} options={VOLTAGES}
                placeholder="Select voltage" />
              <SelectField label="Phases" value={charger.phases}
                onChange={(v) => setC("phases", v)} options={PHASES}
                placeholder="Select phases" />
              <SelectField label="IP Rating (Waterproofing)" value={charger.ipRating}
                onChange={(v) => setC("ipRating", v)} options={IP_RATINGS}
                placeholder="Select IP rating" />
              <TextField label="Cable Length (if tethered)" value={charger.cableLength}
                onChange={(v) => setC("cableLength", v)} placeholder="e.g. 5m" />
              <SelectField label="Warranty" value={charger.warranty}
                onChange={(v) => setC("warranty", v)} options={WARRANTIES}
                placeholder="Select warranty" />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <ToggleField label="Smart Charging" desc="WiFi / app-controlled charging"
                value={charger.smartCharging as boolean} onChange={(v) => setC("smartCharging", v)} />
              <ToggleField label="Tethered Cable" desc="Cable is permanently attached"
                value={charger.tethered as boolean} onChange={(v) => setC("tethered", v)} />
              <ToggleField label="Professional Installation Required" desc="Requires a certified electrician"
                value={charger.installationRequired as boolean} onChange={(v) => setC("installationRequired", v)} />
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Safety & certifications */}
          <Section title="Safety & Compliance">
            <CheckboxGroup
              label="Certifications (select all that apply)"
              options={CERTIFICATIONS_OPT}
              selected={charger.certifications}
              onChange={(v) => setC("certifications", v)}
            />
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              ⚠ Certification documents may be requested by ECOSWAP. Listings without valid certs for electrical products may be removed.
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Commercial */}
          <Section title="Pricing & Location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField label="Price (₦)" icon={<MdAttachMoney />} required type="number"
                value={charger.price as string} onChange={(v) => setC("price", v)} placeholder="e.g. 250000" />
              <SelectField label="Location" icon={<MdLocationOn />} required
                value={charger.location} onChange={(v) => setC("location", v)}
                options={Data.Location?.map((l: any) => l.name) ?? []}
                placeholder="Select location" />
              <div className="md:col-span-2">
                <Label icon={<MdDescription />}>Description</Label>
                <textarea className={`${inputCls} min-h-25 resize-y`}
                  value={charger.description} onChange={(e) => setC("description", e.target.value)}
                  placeholder="Describe the charger — power output, compatibility, installation notes, included accessories..." />
              </div>
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          <Section title="Product Photos (min 3)">
            <ImagePicker images={chargerImages} onChange={setChargerImages}
              errors={chargerErrors} onErrors={setChargerErrors} />
          </Section>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}
              className="bg-linear-to-r from-[#00d9d9] to-[#c946ef] hover:from-[#00c5c5] hover:to-[#b033dd] text-white px-8 rounded-full font-semibold">
              {submitting ? "Posting…" : "Post Charger Listing"}
            </Button>
          </div>
        </form>
      )}

      {/* ── ACCESSORY FORM ────────────────────────────────────────────────────── */}
      {activeTab === "accessory" && (
        <form onSubmit={onSubmitAccessory} className="bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl p-8 space-y-8">
          <SectionTitle>Accessory / Spare Part Listing</SectionTitle>

          {/* Product identity */}
          <Section title="Product Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField label="Product Name" icon={<MdTitle />} required
                value={accessory.name} onChange={(v) => setA("name", v)}
                placeholder="e.g. EV Charging Cable 32A Type 2" />
              <TextField label="Brand" icon={<MdBrandingWatermark />} required
                value={accessory.brand} onChange={(v) => setA("brand", v)} placeholder="e.g. Delphi" />
              <SelectField label="Category" icon={<MdDevicesOther />} required
                value={accessory.category} onChange={(v) => setA("category", v)}
                options={ACCESSORY_CATEGORIES} placeholder="Select category" />
              <SelectField label="Condition" required
                value={accessory.condition} onChange={(v) => setA("condition", v)}
                options={CONDITIONS} placeholder="Select condition" />
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Compatibility */}
          <Section title="Vehicle Compatibility">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="Compatible Vehicle Make" value={accessory.vehicleMake}
                onChange={(v) => setA("vehicleMake", v)} options={EV_MAKES}
                placeholder="Select make or Universal" />
              <TextField label="Compatible Vehicle Model" value={accessory.vehicleModel}
                onChange={(v) => setA("vehicleModel", v)} placeholder="e.g. Model 3, Leaf (or leave blank for universal)" />
              <TextField label="Vehicle Year Range" value={accessory.vehicleYear}
                onChange={(v) => setA("vehicleYear", v)} placeholder="e.g. 2020–2024" />
              <TextField label="Trim / Variant (if specific)" value={accessory.trimVariant}
                onChange={(v) => setA("trimVariant", v)} placeholder="e.g. Long Range, Performance" />
              <TextField label="OEM Part Number" value={accessory.partNumber}
                onChange={(v) => setA("partNumber", v)} placeholder="e.g. 1099171-00-A" />
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Technical specs */}
          <Section title="Technical Specifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="Voltage Rating" value={accessory.voltageRating}
                onChange={(v) => setA("voltageRating", v)} options={VOLTAGES}
                placeholder="Select if applicable" />
              <SelectField label="Connector Type" value={accessory.connectorType}
                onChange={(v) => setA("connectorType", v)} options={CONNECTOR_TYPES}
                placeholder="Select if applicable" />
              <TextField label="Charging Capacity (kW)" value={accessory.chargingKw}
                onChange={(v) => setA("chargingKw", v)} type="number"
                placeholder="e.g. 22" />
              <SelectField label="IP Rating" value={accessory.ipRating}
                onChange={(v) => setA("ipRating", v)} options={IP_RATINGS}
                placeholder="Select if applicable" />
              <TextField label="Cable Length (if cable)" value={accessory.cableLength}
                onChange={(v) => setA("cableLength", v)} placeholder="e.g. 5m" />
              <TextField label="Weight (kg)" value={accessory.weightKg}
                onChange={(v) => setA("weightKg", v)} type="number"
                placeholder="e.g. 1.2" />
              <div className="md:col-span-2">
                <TextField label="Dimensions (L × W × H)" value={accessory.dimensions}
                  onChange={(v) => setA("dimensions", v)} placeholder="e.g. 200mm × 150mm × 80mm" />
              </div>
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Safety */}
          <Section title="Safety & Compliance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="Warranty" value={accessory.warranty}
                onChange={(v) => setA("warranty", v)} options={WARRANTIES}
                placeholder="Select warranty" />
            </div>
            <CheckboxGroup
              label="Certifications"
              options={CERTIFICATIONS_OPT}
              selected={accessory.certifications}
              onChange={(v) => setA("certifications", v)}
            />
            <div className="mt-3">
              <ToggleField label="Professional Installation Required"
                desc="This part requires a certified technician to install"
                value={accessory.installationRequired as boolean}
                onChange={(v) => setA("installationRequired", v)} />
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Commercial */}
          <Section title="Pricing & Location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField label="Price (₦)" icon={<MdAttachMoney />} required type="number"
                value={accessory.price as string} onChange={(v) => setA("price", v)} />
              <SelectField label="Location" icon={<MdLocationOn />} required
                value={accessory.location} onChange={(v) => setA("location", v)}
                options={Data.Location?.map((l: any) => l.name) ?? []}
                placeholder="Select location" />
              <div className="md:col-span-2">
                <Label icon={<MdDescription />}>Description</Label>
                <textarea className={`${inputCls} min-h-30 resize-y`}
                  value={accessory.description}
                  onChange={(e) => setA("description", e.target.value)}
                  placeholder="Include: what it does, what it's compatible with, condition details, installation notes, what's in the box..." />
              </div>
            </div>
          </Section>

          <Separator className="dark:bg-[#2d1e5f]" />

          <Section title="Product Photos (min 3 · include plain background + in-use shot)">
            <ImagePicker images={accessoryImages} onChange={setAccessoryImages}
              errors={accessoryErrors} onErrors={setAccessoryErrors} />
          </Section>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}
              className="bg-linear-to-r from-[#00d9d9] to-[#c946ef] hover:from-[#00c5c5] hover:to-[#b033dd] text-white px-8 rounded-full font-semibold">
              {submitting ? "Posting…" : "Post Accessory Listing"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}