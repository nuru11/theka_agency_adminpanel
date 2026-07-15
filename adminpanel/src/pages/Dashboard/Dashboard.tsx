import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/common/PageLayout';
import ComponentCard from '../../components/common/ComponentCard';

const roleLabels: Record<string, string> = {
  superAdmin: 'Super Admin',
  officeAdmin: 'Office Admin',
  accountant: 'Accountant',
  employee: 'Employee',
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <PageLayout title="Dashboard" description="Welcome to Thiqa Agency admin panel">
     
    </PageLayout>
  );
}
