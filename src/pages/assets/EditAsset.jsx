import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AssetModal from './components/AssetModal';
import { assetService } from '../../services/asset.service';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS, ROLES } from '../../utils/permissions';

const Editor = styled.section`
  margin: 0 auto;
  max-width: 920px;

  > a {
    color: inherit;
  }

  > h1 {
    margin: 16px 0;
  }
`;

const FormPanel = styled.div`
  background: var(--color-background-card, white);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 12px;
`;

function AssetEditor({ id }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    assetService.getAsset(id)
      .then(({ data }) => {
        if (!active) return;
        if (data) setAsset(data);
        else setError(t('assets.failedToLoadAsset', 'Failed to load asset.'));
      })
      .catch(() => {
        if (active) setError(t('assets.failedToLoadAsset', 'Failed to load asset.'));
      });
    return () => { active = false; };
  }, [id, t]);

  return (
    <Editor>
      <Link to="/assets">{t('assets.backToRegister', 'Back to Asset Register')}</Link>
      <h1>{t('common.editAsset')}</h1>
      {error ? <p role="alert">{error}</p> : asset ? (
        <FormPanel>
          <AssetModal isOpen asset={asset} pageAssetId={id} onClose={() => navigate('/assets')} />
        </FormPanel>
      ) : <p role="status">{t('common.loading', 'Loading…')}</p>}
    </Editor>
  );
}

export default function EditAsset() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { hasPermission, userRole } = usePermissions();

  if (!hasPermission(PERMISSIONS.ASSETS) ||
      ![ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(userRole)) {
    return <p role="alert">{t('auth.accessDenied', 'Access denied.')}</p>;
  }
  return <AssetEditor key={id} id={id} />;
}
