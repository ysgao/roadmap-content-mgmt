import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { RoadmapItem, MemberPriority, ProvenanceEvent, EvidenceInput, Horizon } from '../types'
import {
  getRoadmapItems,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  getMemberPriorities,
  createMemberPriority,
  updateMemberPriority,
  deleteMemberPriority,
  getProvenanceEvents,
  getEvidence,
} from '../services/api'
import { useAuth } from '../services/auth'
import ItemForm from '../components/admin/ItemForm'
import PriorityForm from '../components/admin/PriorityForm'
import DeleteConfirm from '../components/admin/DeleteConfirm'
import EvidenceTab from '../components/evidence/EvidenceTab'
import StatusBadge from '../components/shared/StatusBadge'
import ActivityTag from '../components/shared/ActivityTag'

type Tab = 'items' | 'priorities' | 'evidence'

const HORIZON_LABELS: Record<Horizon, string> = {
  Now: 'Now',
  Next: 'Next',
  Later: 'Later',
  UnderAssessment: 'Under Assessment',
  InMaintenance: 'In Maintenance',
}

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('items')

  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([])
  const [priorities, setPriorities] = useState<MemberPriority[]>([])
  const [provenanceEvents, setProvenanceEvents] = useState<ProvenanceEvent[]>([])
  const [evidenceList, setEvidenceList] = useState<EvidenceInput[]>([])

  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [editingItem, setEditingItem] = useState<RoadmapItem | null | 'new'>(null)
  const [deletingItem, setDeletingItem] = useState<RoadmapItem | null>(null)

  const [editingPriority, setEditingPriority] = useState<MemberPriority | null | 'new'>(null)
  const [deletingPriority, setDeletingPriority] = useState<MemberPriority | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [rdData, prData, pvData, evData] = await Promise.all([
        getRoadmapItems(),
        getMemberPriorities(),
        getProvenanceEvents(),
        getEvidence(),
      ])
      const allItems: RoadmapItem[] = []
      for (const horizon of Object.values(rdData.horizons)) {
        allItems.push(...horizon)
      }
      setRoadmapItems(allItems)
      setPriorities(prData)
      setProvenanceEvents(pvData)
      setEvidenceList(evData)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3500)
  }

  async function handleSaveItem(data: Partial<RoadmapItem>) {
    try {
      if (editingItem === 'new') {
        await createRoadmapItem(data)
        showSuccess('Roadmap item created successfully.')
      } else if (editingItem) {
        await updateRoadmapItem(editingItem.id, data)
        showSuccess('Roadmap item updated successfully.')
      }
      setEditingItem(null)
      fetchAll()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function handleDeleteItem() {
    if (!deletingItem) return
    try {
      await deleteRoadmapItem(deletingItem.id)
      setDeletingItem(null)
      showSuccess('Item deleted.')
      fetchAll()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delete failed')
      setDeletingItem(null)
    }
  }

  async function handleSavePriority(data: Partial<MemberPriority>) {
    try {
      if (editingPriority === 'new') {
        await createMemberPriority(data)
        showSuccess('Priority created successfully.')
      } else if (editingPriority) {
        await updateMemberPriority(editingPriority.id, data)
        showSuccess('Priority updated successfully.')
      }
      setEditingPriority(null)
      fetchAll()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function handleDeletePriority() {
    if (!deletingPriority) return
    try {
      await deleteMemberPriority(deletingPriority.id)
      setDeletingPriority(null)
      showSuccess('Priority deleted.')
      fetchAll()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delete failed')
      setDeletingPriority(null)
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    border: 'none',
    background: active ? '#fff' : 'transparent',
    color: active ? '#1a3a5c' : '#718096',
    fontWeight: active ? 700 : 500,
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderBottom: active ? '2px solid #4A90D9' : '2px solid transparent',
    marginBottom: '-1px',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <header style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2340 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" style={{ color: '#90cdf4', textDecoration: 'none', fontSize: '0.85rem' }}>← Dashboard</Link>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#90cdf4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin</div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Content Management</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: '#bee3f8' }}>{user?.name ?? user?.email}</span>
            <button
              onClick={logout}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {successMsg && (
          <div style={{ padding: '12px 16px', background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '6px', color: '#276749', fontSize: '0.87rem', marginBottom: '16px' }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '6px', color: '#c53030', fontSize: '0.87rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c53030', fontWeight: 700 }}>✕</button>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 8px' }}>
            <button style={tabStyle(tab === 'items')} onClick={() => setTab('items')}>
              Roadmap Items {!loading && `(${roadmapItems.length})`}
            </button>
            <button style={tabStyle(tab === 'priorities')} onClick={() => setTab('priorities')}>
              Member Priorities {!loading && `(${priorities.length})`}
            </button>
            <button style={tabStyle(tab === 'evidence')} onClick={() => setTab('evidence')}>
              Evidence {!loading && `(${evidenceList.length})`}
            </button>
          </div>

          <div style={{ padding: '20px' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#718096' }}>Loading...</div>
            ) : (
              <>
                {tab === 'items' && (
                  editingItem !== null ? (
                    <div>
                      <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1a3a5c' }}>
                        {editingItem === 'new' ? 'New Roadmap Item' : `Edit: ${(editingItem as RoadmapItem).title}`}
                      </h3>
                      <ItemForm
                        item={editingItem === 'new' ? undefined : editingItem}
                        provenanceEvents={provenanceEvents}
                        onSave={handleSaveItem}
                        onCancel={() => setEditingItem(null)}
                      />
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#1a3a5c' }}>Roadmap Items</h3>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#718096' }}>{roadmapItems.length} items across all horizons</p>
                        </div>
                        <button
                          onClick={() => setEditingItem('new')}
                          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#1a3a5c', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          + New Item
                        </button>
                      </div>

                      {roadmapItems.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#a0aec0', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                          No roadmap items yet.
                        </div>
                      ) : (
                        <div>
                          {roadmapItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '6px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a202c', marginBottom: '4px' }}>{item.title}</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#718096', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1px 6px' }}>
                                    {HORIZON_LABELS[item.horizon]}
                                  </span>
                                  <StatusBadge status={item.siStatus} />
                                  <ActivityTag type={item.activityType} />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button
                                  onClick={() => setEditingItem(item)}
                                  style={{ padding: '5px 12px', borderRadius: '5px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#4a5568', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeletingItem(item)}
                                  style={{ padding: '5px 12px', borderRadius: '5px', border: '1px solid #fc8181', background: '#fff5f5', color: '#c53030', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}

                {tab === 'priorities' && (
                  editingPriority !== null ? (
                    <div>
                      <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1a3a5c' }}>
                        {editingPriority === 'new' ? 'New Member Priority' : `Edit: ${(editingPriority as MemberPriority).topicTitle}`}
                      </h3>
                      <PriorityForm
                        priority={editingPriority === 'new' ? undefined : editingPriority}
                        provenanceEvents={provenanceEvents}
                        onSave={handleSavePriority}
                        onCancel={() => setEditingPriority(null)}
                      />
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#1a3a5c' }}>Member Priorities</h3>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#718096' }}>{priorities.length} priorities</p>
                        </div>
                        <button
                          onClick={() => setEditingPriority('new')}
                          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#1a3a5c', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          + New Priority
                        </button>
                      </div>

                      {priorities.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#a0aec0', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                          No member priorities yet.
                        </div>
                      ) : (
                        <div>
                          {[...priorities].sort((a, b) => a.rank - b.rank).map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '6px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#4A90D9', color: '#fff', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>
                                {p.rank}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a202c' }}>{p.topicTitle}</div>
                                <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: '2px' }}>
                                  {p.responseCount} responses ({p.responsePercentage}%)
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button
                                  onClick={() => setEditingPriority(p)}
                                  style={{ padding: '5px 12px', borderRadius: '5px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#4a5568', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeletingPriority(p)}
                                  style={{ padding: '5px 12px', borderRadius: '5px', border: '1px solid #fc8181', background: '#fff5f5', color: '#c53030', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}

                {tab === 'evidence' && (
                  <EvidenceTab
                    evidenceList={evidenceList}
                    provenanceEvents={provenanceEvents}
                    onUpdate={fetchAll}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {deletingItem && (
        <DeleteConfirm
          itemTitle={deletingItem.title}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeletingItem(null)}
        />
      )}

      {deletingPriority && (
        <DeleteConfirm
          itemTitle={deletingPriority.topicTitle}
          onConfirm={handleDeletePriority}
          onCancel={() => setDeletingPriority(null)}
        />
      )}

      <footer style={{ marginTop: '48px', padding: '16px 24px', background: '#1a3a5c', color: '#90cdf4', fontSize: '0.8rem', textAlign: 'center' }}>
        SNOMED International &copy; {new Date().getFullYear()} &middot; Admin Console
      </footer>
    </div>
  )
}
