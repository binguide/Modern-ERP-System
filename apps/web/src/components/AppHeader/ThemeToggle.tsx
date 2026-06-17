import { Button, Tooltip, theme } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@stores/uiStore';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme: currentTheme, toggleTheme } = useUiStore();
  const { token } = theme.useToken();
  const isDark = currentTheme === 'dark';
  return (
    <Tooltip title={t(isDark ? 'app.lightMode' : 'app.darkMode')}>
      <Button
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{ fontSize: 18, color: token.colorTextSecondary }}
      />
    </Tooltip>
  );
}
