import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import UsersPage from "./pages/users/UsersPage";
import PropertiesPage from "./pages/settings/PropertiesPage";
import ParksPage from "./pages/settings/ParksPage";
import ActivitiesPage from "./pages/settings/ActivitiesPage";
import TouristsPage from "./pages/tourists/TouristsPage";
import TouristDetailPage from "./pages/tourists/TouristDetailPage";
import PackagesPage from "./pages/packages/PackagesPage";
import HandoffsPage from "./pages/handoffs/HandoffsPage";
import EmployeesPage from "./pages/employees/EmployeesPage";
import SalariesPage from "./pages/employees/SalariesPage";
import ReceivedPage from "./pages/accountant/ReceivedPage";
import PackageSpendingPage from "./pages/accountant/PackageSpendingPage";
import ExpensesPage from "./pages/accountant/ExpensesPage";
import SalaryPaymentsPage from "./pages/accountant/SalaryPaymentsPage";
import AssignmentsPage from "./pages/assignments/AssignmentsPage";
import LogServicePage from "./pages/assignments/LogServicePage";
import HistoryPage from "./pages/assignments/HistoryPage";
import OfficeAdminReport from "./pages/reports/OfficeAdminReport";
import AccountantReport from "./pages/reports/AccountantReport";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/signin" element={<SignIn />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Dashboard />} />

            <Route element={<ProtectedRoute roles={["superAdmin"]} />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings/parks" element={<ParksPage />} />
              <Route path="/reports/office-admin" element={<OfficeAdminReport />} />
              <Route path="/reports/accountant" element={<AccountantReport />} />
            </Route>

            <Route element={<ProtectedRoute roles={["superAdmin", "officeAdmin"]} />}>
              <Route path="/settings/properties" element={<PropertiesPage />} />
              <Route path="/settings/activities" element={<ActivitiesPage />} />
              <Route path="/tourists" element={<TouristsPage />} />
              <Route path="/tourists/:id" element={<TouristDetailPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/handoffs" element={<HandoffsPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/salaries" element={<SalariesPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["superAdmin", "accountant"]} />}>
              <Route path="/received" element={<ReceivedPage />} />
              <Route path="/package-spending" element={<PackageSpendingPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/salary-payments" element={<SalaryPaymentsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["employee"]} />}>
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/assignments/:id/log" element={<LogServicePage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
        <Route path="/signup" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}
