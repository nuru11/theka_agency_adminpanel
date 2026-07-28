import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import TouristsPage from "./pages/tourists/TouristsPage";
import TouristHistoryPage from "./pages/tourists/TouristHistoryPage";
import PropertiesPage from "./pages/settings/PropertiesPage";
import ParksPage from "./pages/settings/ParksPage";
import ExpensesPage from "./pages/settings/ExpensesPage";
import StaffPage from "./pages/settings/StaffPage";
import PackagesPage from "./pages/packages/PackagesPage";
import PackageHistoryPage from "./pages/packages/PackageHistoryPage";
import HandoffsPage from "./pages/handoffs/HandoffsPage";
import ReceivedPage from "./pages/handoffs/ReceivedPage";
import FundReturnsPage from "./pages/handoffs/FundReturnsPage";
import PackageSpendingPage from "./pages/accountant/PackageSpendingPage";
import AccountantPackagesPage from "./pages/accountant/AccountantPackagesPage";
import AccountantPackageDetailPage from "./pages/accountant/AccountantPackageDetailPage";
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

            <Route element={<ProtectedRoute roles={["superAdmin", "officeAdmin", "employee"]} />}>
              <Route path="/tourists" element={<TouristsPage />} />
              <Route path="/tourists/history" element={<TouristHistoryPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/history" element={<PackageHistoryPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["superAdmin", "officeAdmin"]} />}>
              <Route path="/settings/properties" element={<PropertiesPage />} />
              <Route path="/settings/parks" element={<ParksPage />} />
              <Route path="/settings/expenses" element={<ExpensesPage />} />
              <Route path="/settings/staff" element={<StaffPage />} />
              <Route path="/handoffs" element={<HandoffsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["superAdmin"]} />}>
              <Route path="/reports/monthly" element={<MonthlyAnalysisPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["superAdmin", "accountant"]} />}>
              <Route path="/received" element={<ReceivedPage />} />
              <Route path="/package-spending" element={<PackageSpendingPage />} />
              <Route path="/accountant-packages" element={<AccountantPackagesPage />} />
              <Route path="/accountant-packages/:id" element={<AccountantPackageDetailPage />} />
              <Route path="/fund-returns" element={<FundReturnsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
