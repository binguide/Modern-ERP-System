import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const SIDEBAR_TABS = ['activity', 'comments', 'files'] as const;
type SidebarTab = (typeof SIDEBAR_TABS)[number];

interface ErpFormSidebarProps {
  defaultTab?: SidebarTab;
  renderTab?: (tab: SidebarTab) => ReactNode;
}

export function ErpFormSidebar({ defaultTab = 'activity', renderTab }: ErpFormSidebarProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SidebarTab>(defaultTab);

  return (
    <>
      <div className="erp-sidebar-tabs">
        {SIDEBAR_TABS.map((tab) => (
          <button
            key={tab}
            className={`erp-tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`salesOrders.sidebar_${tab}`)}
          </button>
        ))}
      </div>
      <div className="erp-sidebar-content">
        {renderTab ? (
          renderTab(activeTab)
        ) : (
          <p style={{ color: '#8d99a6', fontSize: 13 }}>{t('common.noData')}</p>
        )}
      </div>
    </>
  );
}
