import { useTranslation } from 'react-i18next';
import PageLayout from '../../components/common/PageLayout';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('dashboard.title')} description={t('dashboard.description')}>
      <></>
    </PageLayout>
  );
}
