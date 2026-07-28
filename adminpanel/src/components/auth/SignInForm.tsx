import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t, "auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("auth.signInTitle")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.signInSubtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {error && <p className="text-sm text-error-500">{error}</p>}
              <div>
                <Label>
                  {t("auth.username")} <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder={t("auth.usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <Label>
                  {t("auth.password")} <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer end-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>
              <div>
                <Button className="w-full" size="sm" type="submit" disabled={loading}>
                  {loading ? t("auth.signingIn") : t("auth.signIn")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
