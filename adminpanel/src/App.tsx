import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import TouristsPage from "./pages/tourists/TouristsPage";
import PropertiesPage from "./pages/settings/PropertiesPage";
import ParksPage from "./pages/settings/ParksPage";
import PackagesPage from "./pages/packages/PackagesPage";
import HandoffsPage from "./pages/handoffs/HandoffsPage";
import ReceivedPage from "./pages/handoffs/ReceivedPage";
import FundReturnsPage from "./pages/handoffs/FundReturnsPage";
import PackageSpendingPage from "./pages/accountant/PackageSpendingPage";
import MonthlyAnalysisPage from "./pages/reports/MonthlyAnalysisPage";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/signin" element={<SignIn />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Dashboard />} />

            <Route element={<ProtectedRoute roles={["superAdmin", "officeAdmin"]} />}>
              <Route path="/tourists" element={<TouristsPage />} />
              <Route path="/settings/properties" element={<PropertiesPage />} />
              <Route path="/settings/parks" element={<ParksPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/handoffs" element={<HandoffsPage />} />
              <Route path="/reports/monthly" element={<MonthlyAnalysisPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["superAdmin", "accountant"]} />}>
              <Route path="/received" element={<ReceivedPage />} />
              <Route path="/package-spending" element={<PackageSpendingPage />} />
              <Route path="/fund-returns" element={<FundReturnsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
