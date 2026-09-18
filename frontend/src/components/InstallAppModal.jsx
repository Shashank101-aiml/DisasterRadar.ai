import React, { useState, useEffect } from 'react';

// Real, EAS-built sideloadable APK — replaces the old Capacitor-instructions placeholder.
// Update this after each new build (see mobile/README or `eas build:list` for the latest URL).
const APK_DOWNLOAD_URL = 'https://expo.dev/accounts/disaster-radar/projects/disasterradar-ai/builds';
const APK_VERSION_LABEL = 'v1.0.0 (Preview build)';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [activePlatform, setActivePlatform] = useState('android'); // 'android' | 'pc' | 'ios' | 'apk'
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Listen for the native browser PWA install event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setInstallSuccess(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  // Trigger 1-Click Native Install Prompt if supported by browser
  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      // If browser doesn't have the deferred prompt ready, show relevant instructions
      alert('Native install prompt not directly available in this tab. Follow the step-by-step installation instructions below!');
    }
  };

  return (
    <div
      className="modal-overlay active"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0b1120',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '12px',
          maxWidth: '680px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          color: '#f8fafc'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: '#080c16',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Download DisasterRadar.ai App
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                Install standalone app on Mobile & PC — Works 100% Offline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px'
            }}
          >
            &times;
          </button>
        </div>

        {/* 1-Click Instant Install Hero Action (if browser supports) */}
        <div style={{ padding: '16px 20px', background: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '2px' }}>
                ⚡ 1-Click Direct PWA Installation
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                Install without App Store or Play Store account. Direct offline access on home screen.
              </div>
            </div>
            <button
              onClick={handleTriggerNativeInstall}
              style={{
                background: '#0284c7',
                border: '1px solid #38bdf8',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>{installSuccess ? '✓ Installed on Device!' : 'Install to Device Now'}</span>
            </button>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div style={{ display: 'flex', background: '#080c16', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '6px 12px', gap: '6px' }}>
          {[
            { id: 'android', label: '📱 Android Phone', color: '#10b981' },
            { id: 'pc', label: '💻 Windows / Mac PC', color: '#38bdf8' },
            { id: 'ios', label: '🍎 iPhone / iPad (iOS)', color: '#a855f7' },
            { id: 'apk', label: '📦 Native Android APK', color: '#f97316' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: activePlatform === p.id ? 700 : 500,
                background: activePlatform === p.id ? '#1e293b' : 'transparent',
                color: activePlatform === p.id ? p.color : '#94a3b8',
                border: activePlatform === p.id ? `1px solid ${p.color}` : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Content Body for Active Platform */}
        <div style={{ padding: '20px', maxHeight: '420px', overflowY: 'auto' }}>
          
          {/* ANDROID TAB */}
          {activePlatform === 'android' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#064e3b', color: '#10b981', fontSize: '0.68rem', fontWeight: 800 }}>
                  RECOMMENDED FOR MOBILE
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Works in Chrome, Edge, Brave, Samsung Internet</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#10b981', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Open in Mobile Chrome</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Navigate to DisasterRadar.ai on your Android phone's Chrome browser.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#10b981', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Tap the Menu (⋮) or Install Banner</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Tap the 3 dots in the top-right corner of Chrome, then tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#10b981', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Launch 100% Offline from Home Screen</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      The app appears on your phone screen with its dedicated icon. You can turn on Airplane Mode, and the GPS radar, predictions, and evacuation routing will work without any data connection!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PC WINDOWS / MAC TAB */}
          {activePlatform === 'pc' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#082f49', color: '#38bdf8', fontSize: '0.68rem', fontWeight: 800 }}>
                  WINDOWS & MAC DESKTOP APP
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Chrome & Microsoft Edge native window</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Look at your Browser's URL Address Bar</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      On the right side of the address bar in Chrome or Edge, click the <strong>computer monitor with down arrow</strong> icon: <code>Install DisasterRadar.ai</code>.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Or Click "Install to Device Now" Above</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Click the blue button at the top of this modal to trigger the native installation dialog immediately.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Opens as a Dedicated Desktop Window</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Runs as a standalone desktop window on your Windows Taskbar or Mac Dock with zero browser clutter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IPHONE / IPAD (IOS) TAB */}
          {activePlatform === 'ios' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#3b0764', color: '#c084fc', fontSize: '0.68rem', fontWeight: 800 }}>
                  APPLE IOS
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Safari browser installation</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#9333ea', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Open in Safari on iPhone / iPad</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Apple requires using Safari for home screen app installation.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#9333ea', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Tap the Share Button (Rectangle with Up Arrow)</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Located at the bottom of the Safari toolbar on your iPhone screen.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#9333ea', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Scroll down and tap "Add to Home Screen"</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Tap <strong>Add</strong> in the top right. DisasterRadar.ai now launches in full screen like a native iOS app.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NATIVE APK PACKAGE TAB */}
          {activePlatform === 'apk' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#7c2d12', color: '#fb923c', fontSize: '0.68rem', fontWeight: 800 }}>
                  NATIVE ANDROID APK
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{APK_VERSION_LABEL} · Built with Expo EAS</span>
              </div>

              <a
                href={APK_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#ea580c',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  marginBottom: '14px',
                  boxShadow: '0 2px 10px rgba(234, 88, 12, 0.35)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Download DisasterRadar.apk</span>
              </a>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#f97316', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Allow Installs from This Source</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Android will prompt to enable <strong>"Install unknown apps"</strong> for your browser the first time — allow it.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: '#f97316', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</span>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>Open the Downloaded File</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#94a3b8' }}>
                      Tap the .apk in your notifications or Downloads folder, then tap <strong>Install</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '12px' }}>
                This is a preview build for direct sideloading, bypassing the Google Play Store. It currently connects to a
                development backend on the same local network — full public availability lands once the backend is
                deployed to the cloud.
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: '#080c16',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Offline PWA Service Worker v1.0 • Cache-First Storage
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
