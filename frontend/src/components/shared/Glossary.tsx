import { useState } from 'react'
import { ACTIVITY_COLORS, ACTIVITY_LABELS } from './ActivityTag'
import type { ActivityType } from '../../types'

const HORIZONS = [
  {
    label: 'Now',
    color: '#1a472a',
    description:
      'Work actively in progress within the current planning period. Items have assigned resources and are being actively developed or delivered.',
  },
  {
    label: 'Next',
    color: '#1a3a5c',
    description:
      'Work planned for the next planning period. Resources have been provisionally allocated and the work is queued for development.',
  },
  {
    label: 'Later',
    color: '#3a1a5c',
    description:
      'Work identified and prioritised but not yet scheduled for a specific period. May be contingent on other work completing first.',
  },
  {
    label: 'Under Assessment',
    color: '#5c3a1a',
    description:
      'Work that has been requested or identified but is still being evaluated for feasibility, scope, and prioritisation.',
  },
  {
    label: 'In Maintenance',
    color: '#1a5c4a',
    description:
      'Work that has been completed and transitioned to ongoing maintenance mode. Regular updates occur as part of standard release cycles.',
  },
]

const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string> = {
  MemberDriven:
    'Content development work directly driven by requests and priorities from SNOMED International member organisations.',
  Collaboration:
    'Work conducted jointly with external organisations, standards bodies, or other terminology systems.',
  CRG: 'Work undertaken by or in close collaboration with a Clinical Reference Group (CRG) of subject matter experts.',
  Authoring:
    'Core SNOMED CT content authoring work, including new concept creation, hierarchy restructuring, and attribute model development.',
  QAProgramme:
    'Quality Assurance activities ensuring the accuracy, consistency, and clinical safety of SNOMED CT content.',
  Maintenance:
    'Ongoing maintenance activities including corrections, deprecations, and regular content updates across existing SNOMED CT modules.',
}

const STATUSES = [
  { label: 'Active', color: '#28a745', description: 'Work is currently in progress within the active planning period.' },
  { label: 'Planned', color: '#007bff', description: 'Work is scheduled and committed but not yet started.' },
  { label: 'Paused', color: '#ffc107', description: 'Work has been temporarily halted pending a blocker or decision.' },
  { label: 'Deferred', color: '#6c757d', description: 'Work has been moved out of the current roadmap horizon.' },
]

export default function Glossary() {
  const [open, setOpen] = useState(false)

  return (
    <section
      style={{
        marginTop: '2rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          background: '#f8fafc',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#1a3a5c',
          borderBottom: open ? '1px solid #e2e8f0' : 'none',
        }}
      >
        <span>Glossary &amp; Key</span>
        <span style={{ fontSize: '1.1rem' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '20px', display: 'grid', gap: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Horizons
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {HORIZONS.map(h => (
                <div key={h.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: '120px',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      background: h.color,
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    {h.label}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.5 }}>{h.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Activity Types
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map(type => (
                <div key={type} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: '120px',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      background: ACTIVITY_COLORS[type],
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    {ACTIVITY_LABELS[type]}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.5 }}>
                    {ACTIVITY_DESCRIPTIONS[type]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SI Status
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {STATUSES.map(s => (
                <div key={s.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: '80px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: s.color,
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    {s.label}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.5 }}>{s.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Provenance Chips
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.6 }}>
              Blue provenance chips indicate the evidence source or stakeholder input that led to this roadmap item being
              included. Short codes (e.g. <strong>MS2024</strong>) reference specific surveys, workshops, or forum
              sessions. The optional <sup>#n</sup> superscript links to a specific ranked gap from that event.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
