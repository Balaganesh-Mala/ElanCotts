import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SettingsManager = () => {
  const [settings, setSettings] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await api.get("/settings");
      setSettings(res.data.settings);
    } catch (err) {
      console.error("Settings fetch error", err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!settings) return;

    const formData = new FormData();
    formData.append("storeName", settings.storeName || "");
    formData.append("supportEmail", settings.supportEmail || "");
    formData.append("supportPhone", settings.supportPhone || "");
    formData.append("address", settings.address || "");

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      setSaving(true);
      await api.put("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadSettings();
    } catch (err) {
      console.error("Settings update error", err);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="w-full flex justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Store Settings
        </h2>

        <Card className="shadow-sm border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">General Information</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Store Name */}
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                  name="storeName"
                  value={settings.storeName || ""}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  name="supportEmail"
                  type="email"
                  value={settings.supportEmail || ""}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label>Support Phone</Label>
                <Input
                  name="supportPhone"
                  value={settings.supportPhone || ""}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  name="address"
                  value={settings.address || ""}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                />

                {settings.logo?.url && (
                  <div className="mt-3">
                    <img
                      src={settings.logo.url}
                      alt="Store Logo"
                      className="h-16 w-auto object-contain rounded-md border p-2 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <Button 
                type="submit" 
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsManager;
