import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/dusco/AuthShell";
import ConsentCheckboxes from "@/components/dusco/ConsentCheckboxes";
import { useColdStartMessage } from "@/components/dusco/ColdStartLoader";
import { api } from "@/lib/duscoApi";
import { isValidTzPhone } from "@/lib/duscoFormat";
import { useLanguage } from "@/lib/i18n";
import LanguagePicker from "@/components/dusco/LanguagePicker";

export default function Register() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [consents, setConsents] = useState({ operate: false, marketing: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const slow = useColdStartMessage();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t("auth.register.error.name");
    if (!isValidTzPhone(form.phone)) e.phone = t("auth.register.error.phone");
    if (form.password.length < 6) e.password = t("auth.register.error.password");
    if (!consents.operate) e.operate = t("auth.consent.error.operate");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      // Consent goes to the server with the registration itself. The backend
      // validates it before creating the account and rolls the account back if
      // the consent record cannot be written — so an account never exists
      // without the record that justifies processing its data.
      const res = await api.register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.password,
        language,
        consents: [
          { purpose: "service_operation", granted: true },
          { purpose: "marketing", granted: !!consents.marketing },
        ],
      });
      navigate("/verify-otp", {
        state: { phone: form.phone.trim(), name: form.name.trim(), duscoNumber: res.duscoNumber },
      });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footer={<>{t("auth.register.haveAccount")} <Link to="/login" className="text-dusco-red font-medium">{t("common.login")}</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <p className="text-sm font-medium text-dusco-ink mb-2">{t("auth.register.languageLabel")}</p>
          <LanguagePicker value={language} onChange={setLanguage} ariaLabel={t("auth.register.languageLabel")} />
          <p className="text-xs text-dusco-ink-mute mt-1.5">{t("auth.register.languageHelp")}</p>
        </div>

        <Field label={t("auth.register.name")} error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="auth-input"
            placeholder={t("auth.register.namePlaceholder")}
            autoComplete="name"
          />
        </Field>
        <Field label={t("auth.register.phone")} error={errors.phone}>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="auth-input"
            placeholder="0712345678"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
        <Field label={t("auth.register.password")} error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="auth-input"
            placeholder={t("auth.register.passwordPlaceholder")}
            autoComplete="new-password"
          />
        </Field>

        <div className="pt-1">
          <p className="text-sm font-medium text-dusco-ink mb-2">{t("auth.consent.heading")}</p>
          <ConsentCheckboxes consents={consents} onChange={setConsents} errors={errors} />
        </div>

        {serverError && <p className="text-sm text-dusco-red bg-dusco-red-soft rounded-xl px-3 py-2.5">{serverError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-dusco-red text-white font-medium hover:bg-dusco-red-dark disabled:opacity-60 transition-colors"
        >
          {loading ? (slow ? t("auth.login.waking") : "…") : t("auth.register.submit")}
        </button>
      </form>
      <style>{`
        .auth-input{width:100%;padding:0.875rem 1rem;border-radius:0.875rem;border:1px solid hsl(var(--border));background:hsl(var(--card));font-size:1rem;color:hsl(var(--foreground));outline:none;transition:border-color .15s,box-shadow .15s}
        .auth-input:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary) / .12)}
      `}</style>
    </AuthShell>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dusco-ink mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-dusco-red mt-1">{error}</p>}
    </div>
  );
}