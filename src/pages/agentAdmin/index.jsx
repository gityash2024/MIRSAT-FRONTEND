import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ShieldCheck, BarChart3, Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import agentService from '../../services/agent.service';
import { useAuth } from '../../hooks/useAuth';

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 16px; }
`;
const PageTitle = styled.h1`
  font-size: 28px;
  color: #1e293b;
  font-weight: 700;
  margin-bottom: 4px;
`;
const PageSubtitle = styled.p`color: #64748b; font-size: 15px; margin: 0 0 20px;`;
const TabsHeader = styled.div`
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
  margin-bottom: 18px;
`;
const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border: 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: ${p => (p.$active ? '#fff' : '#475467')};
  background: ${p => (p.$active ? 'var(--color-navy)' : 'transparent')};
`;
const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
`;
const MatrixTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  th, td { border: 1px solid #eef2f6; padding: 7px 9px; text-align: center; }
  th { background: #f8fafc; color: #344054; }
  td.tool { text-align: start; font-weight: 600; color: var(--color-navy); white-space: nowrap; }
  input { cursor: pointer; width: 15px; height: 15px; accent-color: var(--color-teal); }
`;
const UsageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;
const Stat = styled.div`
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
  .label { font-size: 12px; color: #667085; margin-bottom: 4px; }
  .value { font-size: 22px; font-weight: 800; color: var(--color-navy); }
`;
const ToolButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 13px;
  border: 1px solid var(--color-teal);
  border-radius: 8px;
  background: #fff;
  color: var(--color-navy);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #f4fbfb; }
`;

const AgentAdmin = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('permissions');
  const [policies, setPolicies] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = ['admin', 'superadmin'].includes(String(user?.role || '').toLowerCase());

  const refresh = async () => {
    setLoading(true);
    try {
      const [policyData, usageData] = await Promise.all([
        agentService.getToolPolicies().catch(() => null),
        agentService.getUsage('org').catch(() => null),
      ]);
      setPolicies(policyData);
      setUsage(usageData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  if (!isAdmin) return <PageContainer><PageTitle>AI Agent Admin</PageTitle><PageSubtitle>Administrator access required.</PageSubtitle></PageContainer>;

  const denied = new Set((policies?.policies || []).filter(p => !p.allowed).map(p => `${p.role}:${p.toolName}`));

  const togglePolicy = async (role, toolName) => {
    const key = `${role}:${toolName}`;
    const nextAllowed = denied.has(key); // currently denied → allow
    try {
      await agentService.setToolPolicy(role, toolName, nextAllowed);
      setPolicies(current => {
        const rest = (current?.policies || []).filter(p => !(p.role === role && p.toolName === toolName));
        return { ...current, policies: [...rest, { role, toolName, allowed: nextAllowed }] };
      });
      toast.success(`${toolName} ${nextAllowed ? 'allowed' : 'denied'} for ${role}`);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Could not update policy');
    }
  };

  const downloadAudit = async () => {
    try {
      const blob = await agentService.exportAuditCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `agent-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link); link.click(); link.remove();
      URL.revokeObjectURL(url);
    } catch (_error) {
      toast.error('Could not export the audit trail');
    }
  };

  return (
    <PageContainer>
      <PageTitle>AI Agent Admin</PageTitle>
      <PageSubtitle>Govern which roles can use which assistant actions, monitor usage, and export the audit trail.</PageSubtitle>
      <TabsHeader role="tablist">
        <TabButton type="button" role="tab" aria-selected={tab === 'permissions'} $active={tab === 'permissions'} onClick={() => setTab('permissions')}><ShieldCheck size={15} /> Permissions</TabButton>
        <TabButton type="button" role="tab" aria-selected={tab === 'usage'} $active={tab === 'usage'} onClick={() => setTab('usage')}><BarChart3 size={15} /> Usage</TabButton>
      </TabsHeader>

      {tab === 'permissions' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong style={{ color: 'var(--color-navy)' }}>Role × agent-action matrix</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <ToolButton type="button" onClick={refresh}><RefreshCw size={13} /> Refresh</ToolButton>
              <ToolButton type="button" onClick={downloadAudit}><Download size={13} /> Audit CSV</ToolButton>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#667085', marginTop: 0 }}>
            Checked = allowed for that role (default). Unchecking denies the tool even if base permissions would allow it. Note: the assistant itself is currently limited to admin accounts; these toggles also future-proof wider rollouts.
          </p>
          {loading && <p style={{ fontSize: 13, color: '#667085' }}>Loading…</p>}
          {policies && (
            <div style={{ overflowX: 'auto' }}>
              <MatrixTable>
                <thead>
                  <tr><th style={{ textAlign: 'start' }}>Agent action</th>{policies.roles.map(role => <th key={role}>{role}</th>)}</tr>
                </thead>
                <tbody>
                  {policies.tools.map(tool => (
                    <tr key={tool}>
                      <td className="tool">{tool}</td>
                      {policies.roles.map(role => (
                        <td key={`${role}:${tool}`}>
                          <input
                            type="checkbox"
                            aria-label={`${tool} for ${role}`}
                            checked={!denied.has(`${role}:${tool}`)}
                            onChange={() => togglePolicy(role, tool)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </MatrixTable>
            </div>
          )}
        </Card>
      )}

      {tab === 'usage' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong style={{ color: 'var(--color-navy)' }}>AI usage — {usage?.month || 'this month'}</strong>
            <ToolButton type="button" onClick={refresh}><RefreshCw size={13} /> Refresh</ToolButton>
          </div>
          {usage ? (
            <>
              <UsageGrid>
                <Stat><div className="label">Your tokens</div><div className="value">{(usage.self?.totalTokens || 0).toLocaleString()}</div></Stat>
                <Stat><div className="label">Your calls</div><div className="value">{(usage.self?.calls || 0).toLocaleString()}</div></Stat>
                <Stat><div className="label">Budget</div><div className="value">{usage.self?.budget ? usage.self.budget.toLocaleString() : '∞'}</div></Stat>
                <Stat><div className="label">Remaining</div><div className="value">{usage.self?.remaining === null || usage.self?.remaining === undefined ? '∞' : usage.self.remaining.toLocaleString()}</div></Stat>
              </UsageGrid>
              {Array.isArray(usage.org) && usage.org.length > 0 && (
                <MatrixTable>
                  <thead><tr><th style={{ textAlign: 'start' }}>User</th><th>Total tokens</th><th>Calls</th></tr></thead>
                  <tbody>
                    {usage.org.map(row => (
                      <tr key={row.userId}><td className="tool">{row.userId}</td><td>{(row.totalTokens || 0).toLocaleString()}</td><td>{(row.calls || 0).toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </MatrixTable>
              )}
            </>
          ) : <p style={{ fontSize: 13, color: '#667085' }}>{loading ? 'Loading…' : 'No usage data yet.'}</p>}
        </Card>
      )}
    </PageContainer>
  );
};

export default AgentAdmin;
