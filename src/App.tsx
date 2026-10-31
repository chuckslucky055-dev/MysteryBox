import { useEffect, useMemo, useState } from 'react';
import { auth, api } from '@appdeploy/client';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Eye,
  Fingerprint,
  FolderLock,
  KeyRound,
  Lock,
  LogOut,
  Menu,
  Radio,
  Search,
  Shield,
  Sparkles,
  Target,
  UserRound,
  X,
} from 'lucide-react';

type View = 'home' | 'discover' | 'case' | 'profile' | 'classified';
type Evidence = {
  id: string;
  title: string;
  type: string;
  detail: string;
  clue: string;
};
type Suspect = {
  id: string;
  name: string;
  role: string;
  status: string;
  statement: string;
  pressure: string;
};
const evidence: Evidence[] = [
  {
    id: 'tape',
    title: 'The final recording',
    type: 'AUDIO TRANSCRIPT',
    detail:
      'A 19-second transmission captured at 03:17. Beneath the static, a second voice whispers: “Don’t answer the fourth tone.”',
    clue: 'A fourth tone appears in the station equipment log.',
  },
  {
    id: 'log',
    title: 'Equipment maintenance log',
    type: 'DOCUMENT',
    detail:
      'The transmitter was manually switched to auxiliary channel 4 at 03:11. The change was authorised with the initials M.V.',
    clue: 'M.V. matches the initials on a visitor badge.',
  },
  {
    id: 'badge',
    title: 'Visitor badge 04',
    type: 'PHYSICAL EVIDENCE',
    detail:
      'A damaged visitor badge was found beneath the studio console. The printed name is partially burned away; the access stripe is intact.',
    clue: 'The access stripe records entry to the archive room at 03:09.',
  },
  {
    id: 'photo',
    title: 'Control room photograph',
    type: 'PHOTOGRAPH',
    detail:
      'A still image taken at 03:14 shows six empty chairs. A reflection in the glass reveals a seventh silhouette standing behind the camera.',
    clue: 'The silhouette appears to be wearing a station security lanyard.',
  },
  {
    id: 'map',
    title: 'Signal trace',
    type: 'TECHNICAL TRACE',
    detail:
      'The final signal did not travel through the public antenna. It was routed through a private relay beneath the old broadcast tower.',
    clue: 'The relay access hatch is listed on the station floor plan.',
  },
  {
    id: 'note',
    title: 'Folded note',
    type: 'HANDWRITTEN NOTE',
    detail:
      '“If the clock stops, leave the lights on. It can only follow the sound.” The paper carries a faint smell of ozone.',
    clue: 'The note is written on paper from the station archive.',
  },
];
const suspects: Suspect[] = [
  {
    id: 'mara',
    name: 'Mara Voss',
    role: 'Broadcast engineer',
    status: 'PERSON OF INTEREST',
    statement:
      'I left the control room before the final transmission. The auxiliary channel was already damaged.',
    pressure:
      'The maintenance log shows your initials authorising channel 4 at 03:11. Why?',
  },
  {
    id: 'eli',
    name: 'Eli Mercer',
    role: 'Night producer',
    status: 'WITNESS',
    statement:
      'I heard a tone through the studio wall. Then every monitor showed the same empty hallway.',
    pressure:
      'You said you heard one tone. The recording contains four. Which one did you hear?',
  },
  {
    id: 'jonah',
    name: 'Jonah Reed',
    role: 'Security supervisor',
    status: 'PERSON OF INTEREST',
    statement:
      'No one entered or left the building. The cameras never went offline.',
    pressure:
      'A seventh silhouette appears in the control room reflection. Why is it wearing security identification?',
  },
  {
    id: 'sana',
    name: 'Sana Okafor',
    role: 'Archive researcher',
    status: 'WITNESS',
    statement:
      'The station kept old recordings in the basement. Some were never catalogued.',
    pressure:
      'The folded note uses archive paper. What was stored beneath the station?',
  },
  {
    id: 'noah',
    name: 'Noah Vale',
    role: 'Station director',
    status: 'UNAVAILABLE',
    statement:
      'The station has no comment. All records have been transferred to central administration.',
    pressure:
      'Why was the private relay omitted from the official building plans?',
  },
];
const caseData = {
  title: 'The Vanishing Frequency',
  code: 'CASE 001',
  category: 'SIGNAL ANOMALY',
  difficulty: 'CLASSIFIED',
  summary:
    'At exactly 03:17 AM, an entire radio station stopped broadcasting. Seven employees disappeared. Security footage shows nobody leaving. One final transmission remains.',
  transmission: 'If you’re hearing this, it’s already inside.',
};

function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [questioned, setQuestioned] = useState<string[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState('mara');
  const [theory, setTheory] = useState('');
  const [accusation, setAccusation] = useState('');
  const [ending, setEnding] = useState('');
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    auth
      .getUser()
      .then(async current => {
        setUser(current);
        if (current) {
          try {
            const result = await api.get('/api/progress');
            const progress = result.data?.progress;
            if (progress) {
              setFound(progress.found || []);
              setQuestioned(progress.questioned || []);
              setTheory(progress.theory || '');
              setAccusation(progress.accusation || '');
              setEnding(progress.ending || '');
            }
          } catch {
            setNotice(
              'Your saved investigation could not be loaded. You can still play this case.'
            );
          }
        }
      })
      .catch(() =>
        setNotice('Sign-in could not be restored. Please try again.')
      )
      .finally(() => setLoading(false));
  }, []);

  const progress = Math.round(
    ((found.length + questioned.length) / (evidence.length + suspects.length)) *
      100
  );
  const filteredEvidence = useMemo(
    () =>
      evidence.filter(item =>
        (item.title + item.type).toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const signIn = async () => {
    try {
      await auth.signInWithRedirect();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'Sign-in failed. Please retry.'
      );
    }
  };
  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setSaved(false);
    setNotice('Signed out.');
  };
  const saveProgress = async () => {
    if (!user) {
      setNotice('Sign in to save your investigation across devices.');
      return;
    }
    try {
      await api.post('/api/progress', {
        found,
        questioned,
        theory,
        accusation,
        ending,
      });
      setSaved(true);
      setNotice('Investigation progress saved securely.');
    } catch {
      setNotice(
        'Could not save right now. Your current session is still active.'
      );
    }
  };
  const collectEvidence = (id: string) =>
    setFound(current => (current.includes(id) ? current : [...current, id]));
  const questionSuspect = (id: string) =>
    setQuestioned(current =>
      current.includes(id) ? current : [...current, id]
    );
  const makeAccusation = () => {
    if (found.length < 3 || questioned.length < 2) {
      setNotice(
        'Gather at least 3 evidence items and question 2 suspects before making an accusation.'
      );
      return;
    }
    const result =
      accusation === 'mara'
        ? 'You found the engineer’s fingerprints on the relay panel. But the final signal was already waiting before she arrived. Mara opened the door; something else walked through. CASE STATUS: PARTIALLY SOLVED.'
        : accusation === 'jonah'
          ? 'Jonah’s security credentials opened the archive hatch. The footage was never switched off — it was showing a loop. You have exposed the cover-up, but the seven missing voices are still transmitting. CASE STATUS: UNRESOLVED.'
          : 'Your accusation exposes a contradiction in the official timeline. The station director’s records are incomplete, and the private relay remains active. CASE STATUS: NEW LEAD DISCOVERED.';
    setEnding(result);
  };

  const nav = (target: View) => {
    setView(target);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const startCase = () => nav('case');

  if (loading)
    return (
      <div className="boot">
        <div className="boot-mark">
          M<span>.</span>
        </div>
        <div className="boot-line" />
        <p>ESTABLISHING SECURE CONNECTION</p>
      </div>
    );

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <button
          className="brand"
          onClick={() => nav('home')}
          aria-label="MysteryBox home"
        >
          <span className="brand-mark">
            M<span>.</span>
          </span>
          <span>
            MYSTERY<span className="brand-light">BOX</span>
            <small>THE UNKNOWN IS WAITING</small>
          </span>
        </button>
        <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
          <button
            className={view === 'discover' ? 'active' : ''}
            onClick={() => nav('discover')}
          >
            Discover
          </button>
          <button onClick={startCase}>
            Case files <span className="nav-count">01</span>
          </button>
          <button
            className={view === 'classified' ? 'active' : ''}
            onClick={() => nav('classified')}
          >
            Classified
          </button>
        </nav>
        <div className="top-actions">
          {user ? (
            <button className="profile-chip" onClick={() => nav('profile')}>
              <span className="online-dot" />
              {user.name || 'Detective'} <ChevronRight size={14} />
            </button>
          ) : (
            <button className="signin-button" onClick={signIn}>
              <UserRound size={15} /> Sign in
            </button>
          )}
          <button
            className="menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <span>{notice}</span>
          <button onClick={() => setNotice('')}>
            <X size={15} />
          </button>
        </div>
      )}

      {view === 'home' && (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="live-dot" /> SECURE CHANNEL ESTABLISHED{' '}
                <span className="eyebrow-line" />
              </div>
              <p className="hero-kicker">THE TRUTH IS BURIED IN THE STATIC</p>
              <h1>
                EVERY SECRET
                <br />
                HAS A <em>PRICE.</em>
              </h1>
              <p className="hero-description">
                Some stories are told. Others are uncovered. Enter a world of
                hidden transmissions, impossible disappearances and secrets that
                refuse to stay buried.
              </p>
              <div className="hero-buttons">
                <button className="primary-button" onClick={startCase}>
                  <span>BEGIN INVESTIGATION</span>
                  <ArrowRight size={17} />
                </button>
                <button className="text-button" onClick={() => nav('discover')}>
                  <Eye size={16} /> Explore case files
                </button>
              </div>
              <div className="hero-meta">
                <span>
                  <Shield size={14} /> ENCRYPTED EXPERIENCE
                </span>
                <span>
                  <Activity size={14} /> 01 ACTIVE CASE
                </span>
                <span>
                  <Lock size={13} /> ACCESS LEVEL 01
                </span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="visual-top">
                <span>
                  <span className="live-dot" /> INCOMING TRANSMISSION
                </span>
                <span>CH. 04 / 03:17:09</span>
              </div>
              <div className="radar-wrap">
                <div className="radar-grid">
                  <div className="radar-sweep" />
                  <div className="radar-ring ring-one" />
                  <div className="radar-ring ring-two" />
                  <div className="radar-ring ring-three" />
                  <div className="radar-cross" />
                  <div className="radar-ping ping-one" />
                  <div className="radar-ping ping-two" />
                  <div className="radar-center">
                    <AudioLines size={29} />
                  </div>
                </div>
                <span className="radar-label label-a">SIGNAL LOST</span>
                <span className="radar-label label-b">UNKNOWN SOURCE</span>
              </div>
              <div className="transmission">
                <span>LAST RECOVERED MESSAGE</span>
                <p>“{caseData.transmission}”</p>
                <div className="waveform">
                  {Array.from({ length: 38 }, (_, i) => (
                    <i
                      key={i}
                      style={{ height: 10 + ((i * 17) % 27) + 'px' }}
                    />
                  ))}
                </div>
              </div>
              <div className="visual-bottom">
                <span>
                  TRACE ORIGIN: <b>UNKNOWN</b>
                </span>
                <span>
                  ENCRYPTION: <b>ACTIVE</b>
                </span>
              </div>
            </div>
            <div className="hero-index">
              001 <span>/</span> 009
            </div>
          </section>
          <section className="ticker">
            <span>THE FILES ARE OPEN</span>
            <i /> <span>THE SIGNAL IS LIVE</span>
            <i /> <span>TRUST NOTHING</span>
            <i /> <span>FOLLOW THE EVIDENCE</span>
            <i />
          </section>
          <section className="section-block featured">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR FIRST ASSIGNMENT</p>
                <h2>
                  THE CASE THAT
                  <br />
                  <em>STARTED IT ALL.</em>
                </h2>
              </div>
              <span className="section-number">01 / FEATURED</span>
            </div>
            <div className="case-feature">
              <div className="case-art">
                <div className="case-art-grid" />
                <div className="case-stamp">
                  CLASSIFIED
                  <br />
                  <b>LEVEL 01</b>
                </div>
                <Radio size={74} strokeWidth={1} />
                <div className="case-art-code">FREQ_0317 // SIGNAL TRACE</div>
              </div>
              <div className="case-info">
                <div className="case-tags">
                  <span>CASE 001</span>
                  <span>•</span>
                  <span>SIGNAL ANOMALY</span>
                  <span className="tag-red">NEW CASE</span>
                </div>
                <h3>
                  THE VANISHING
                  <br />
                  <em>FREQUENCY</em>
                </h3>
                <p>{caseData.summary}</p>
                <div className="case-stats">
                  <span>
                    <b>05</b> SUSPECTS
                  </span>
                  <span>
                    <b>06</b> EVIDENCE FILES
                  </span>
                  <span>
                    <b>03</b> POSSIBLE OUTCOMES
                  </span>
                </div>
                <button className="outline-button" onClick={startCase}>
                  OPEN CASE FILE <ArrowRight size={16} />
                </button>
              </div>
            </div>          </section>
          <section className="manifesto">
            <span className="manifesto-icon">
              <Fingerprint size={25} />
            </span>
            <p>THE WORLD IS NOT WHAT IT SEEMS.</p>
            <h2>
              LOOK CLOSER.
              <br />
              <em>QUESTION EVERYTHING.</em>
            </h2>
            <span className="manifesto-sub">
              YOUR INVESTIGATION BEGINS WHERE THE STORY ENDS.
            </span>
          </section>
        </main>
      )}

      {view === 'discover' && (
        <main className="page-main">
          <div className="page-eyebrow">
            INTELLIGENCE ARCHIVE / CASE DIRECTORY
          </div>
          <div className="page-title-row">
            <div>
              <h1>
                CASE <em>FILES.</em>
              </h1>
              <p>Every unanswered question leaves a trail.</p>
            </div>
            <span className="archive-count">01 RECORD FOUND</span>
          </div>
          <div className="filter-row">
            <div className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search evidence in active case..."
              />
            </div>
            <span className="filter-label">
              <FolderLock size={14} /> ACCESS LEVEL 01
            </span>
          </div>
          <div className="directory-card" onClick={startCase}>
            <div className="directory-art">
              <Radio size={42} />
              <span>03:17</span>
            </div>
            <div className="directory-content">
              <div className="case-tags">
                <span>CASE 001</span>
                <span>•</span>
                <span>SIGNAL ANOMALY</span>
              </div>
              <h2>THE VANISHING FREQUENCY</h2>
              <p>
                Seven employees. One impossible disappearance. A signal that
                should not exist.
              </p>
              <div className="directory-meta">
                <span>
                  DIFFICULTY: <b>CLASSIFIED</b>
                </span>
                <span>
                  STATUS: <b>OPEN</b>
                </span>
              </div>
            </div>
            <ChevronRight className="directory-arrow" />
          </div>
          <div className="locked-card">
            <Lock size={20} />
            <div>
              <b>ADDITIONAL FILES SEALED</b>
              <p>
                Further investigations will be unlocked as the MysteryBox
                archive expands.
              </p>
            </div>
            <span>COMING SOON</span>
          </div>
        </main>
      )}

      {view === 'case' && (
        <main className="investigation-page">
          <div className="investigation-top">
            <button className="back-link" onClick={() => nav('discover')}>
              <ArrowLeft size={15} /> CASE DIRECTORY
            </button>
            <div className="secure-label">
              <span className="live-dot" /> LIVE INVESTIGATION SESSION
            </div>
            <span className="case-code">MB / 001 / 0317</span>
          </div>
          <div className="investigation-heading">
            <div>
              <p className="eyebrow">ACTIVE INVESTIGATION / SIGNAL ANOMALY</p>
              <h1>
                THE VANISHING
                <br />
                <em>FREQUENCY.</em>
              </h1>
            </div>
            <div className="progress-card">
              <span>INVESTIGATION PROGRESS</span>
              <b>{progress}%</b>
              <div className="progress-track">
                <i style={{ width: progress + '%' }} />
              </div>
              <small>
                {found.length} / 6 EVIDENCE • {questioned.length} / 5 INTERVIEWS
              </small>
            </div>
          </div>
          <div className="briefing">
            <div className="briefing-icon">
              <Radio size={25} />
            </div>
            <div>
              <span>INCIDENT BRIEF / 03:17 AM</span>
              <p>{caseData.summary}</p>
            </div>
          </div>
          <div className="investigation-grid">
            <section className="workspace-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-index">01</span>
                  <h2>EVIDENCE BOARD</h2>
                </div>
                <span>
                  {found.length.toString().padStart(2, '0')} / 06 RECOVERED
                </span>
              </div>
              <p className="panel-intro">
                Examine every recovered item. The smallest detail may change
                everything.
              </p>
              <div className="evidence-grid">
                {evidence.map((item, i) => (
                  <button
                    className={
                      found.includes(item.id)
                        ? 'evidence-card found'
                        : 'evidence-card'
                    }
                    key={item.id}
                    onClick={() => collectEvidence(item.id)}
                  >
                    <div className="evidence-card-top">
                      <span>EV-{String(i + 1).padStart(2, '0')}</span>
                      {found.includes(item.id) ? (
                        <BadgeCheck size={16} />
                      ) : (
                        <Lock size={14} />
                      )}
                    </div>
                    <div className="evidence-icon">
                      {item.id === 'tape' ? (
                        <AudioLines />
                      ) : item.id === 'log' ? (
                        <ClipboardList />
                      ) : item.id === 'badge' ? (
                        <Fingerprint />
                      ) : item.id === 'photo' ? (
                        <Eye />
                      ) : item.id === 'map' ? (
                        <Target />
                      ) : (
                        <BookOpen />
                      )}
                    </div>
                    <b>{item.title}</b>
                    <small>{item.type}</small>
                    <span className="inspect-link">
                      {found.includes(item.id)
                        ? 'EVIDENCE RECOVERED'
                        : 'INSPECT FILE'}{' '}
                      <ArrowRight size={12} />
                    </span>
                  </button>
                ))}
              </div>
              <div className="detail-panel">
                <div className="detail-header">
                  <span>RECOVERED INTELLIGENCE</span>
                  <span>{found.length} ITEMS</span>
                </div>
                {found.length === 0 ? (
                  <p className="empty-state">
                    No evidence recovered. Select a file above to begin your
                    examination.
                  </p>
                ) : (
                  <div className="recovered-list">
                    {evidence
                      .filter(e => found.includes(e.id))
                      .map(e => (
                        <div key={e.id}>
                          <b>{e.title}</b>
                          <p>{e.detail}</p>
                          <small>LEAD: {e.clue}</small>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>
            <aside className="suspect-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-index">02</span>
                  <h2>PERSONS OF INTEREST</h2>
                </div>
                <span>05 IDENTIFIED</span>
              </div>
              <p className="panel-intro">
                Five names. Five stories. Not all of them can be true.
              </p>
              <div className="suspect-list">
                {suspects.map((s, i) => (
                  <button
                    key={s.id}
                    className={
                      selectedSuspect === s.id
                        ? 'suspect-row selected'
                        : 'suspect-row'
                    }
                    onClick={() => setSelectedSuspect(s.id)}
                  >
                    <span className="suspect-number">0{i + 1}</span>
                    <span className="suspect-avatar">
                      {s.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </span>
                    <span className="suspect-name">
                      <b>{s.name}</b>
                      <small>{s.role}</small>
                    </span>
                    <span
                      className={
                        s.status === 'WITNESS'
                          ? 'status-witness'
                          : 'status-person'
                      }
                    >
                      {s.status}
                    </span>
                  </button>
                ))}
              </div>
              <div className="interview-box">
                <div className="interview-title">
                  <span>INTERVIEW ROOM / 04</span>
                  <span className="recording-dot">● REC</span>
                </div>
                <h3>{suspects.find(s => s.id === selectedSuspect)?.name}</h3>
                <p className="role-label">
                  {suspects.find(s => s.id === selectedSuspect)?.role}
                </p>
                <blockquote>
                  “{suspects.find(s => s.id === selectedSuspect)?.statement}”
                </blockquote>
                <div className="question-prompt">
                  <span>FOLLOW-UP QUESTION</span>
                  <p>
                    {suspects.find(s => s.id === selectedSuspect)?.pressure}
                  </p>
                </div>
                <button
                  className="interview-button"
                  onClick={() => questionSuspect(selectedSuspect)}
                >
                  {questioned.includes(selectedSuspect)
                    ? 'INTERVIEW LOGGED'
                    : 'LOG INTERVIEW'}{' '}
                  <ArrowRight size={14} />
                </button>
              </div>
            </aside>
          </div>
          <section className="theory-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-index">03</span>
                <h2>YOUR WORKING THEORY</h2>
              </div>
              <span>INVESTIGATOR NOTES</span>
            </div>
            <textarea
              value={theory}
              onChange={e => setTheory(e.target.value)}
              placeholder="Connect the evidence. What do you believe happened at 03:17? Your notes are part of the case record..."
            />
            <div className="accusation-row">
              <div>
                <label htmlFor="accusation">FINAL ACCUSATION</label>
                <select
                  id="accusation"
                  value={accusation}
                  onChange={e => {
                    setAccusation(e.target.value);
                    setEnding('');
                  }}
                >
                  <option value="">Select a person of interest...</option>
                  {suspects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.role}
                    </option>
                  ))}
                </select>
              </div>
              <button className="primary-button" onClick={makeAccusation}>
                SUBMIT ACCUSATION <ArrowRight size={16} />
              </button>
            </div>
            {ending && (
              <div className="ending-card">
                <div className="ending-stamp">CASE UPDATE / 001</div>
                <h3>THE TRUTH IS NOT THE END.</h3>
                <p>{ending}</p>
                <button
                  className="text-button"
                  onClick={() => {
                    setEnding('');
                    setAccusation('');
                  }}
                >
                  REOPEN INVESTIGATION <ArrowRight size={14} />
                </button>
              </div>
            )}
            <div className="save-row">
              <span>
                {user
                  ? 'Your investigation can sync to your detective profile.'
                  : 'Playing as guest. Sign in to save your progress across devices.'}
              </span>
              <button className="save-button" onClick={saveProgress}>
                {saved ? <BadgeCheck size={15} /> : <Lock size={14} />}{' '}
                {saved ? 'SAVED' : 'SAVE INVESTIGATION'}
              </button>
            </div>
          </section>
        </main>
      )}

      {view === 'profile' && (
        <main className="page-main">
          <div className="page-eyebrow">
            DETECTIVE NETWORK / PERSONNEL RECORD
          </div>
          <h1>
            YOUR <em>PROFILE.</em>
          </h1>
          <div className="profile-card">
            <div className="profile-emblem">
              <Fingerprint size={46} />
            </div>
            <div>
              <span>REGISTERED INVESTIGATOR</span>
              <h2>{user?.name || 'Field Investigator'}</h2>
              <p>{user?.email || 'Verified account'}</p>
              <small>IDENTITY VERIFIED / LEVEL 01</small>
            </div>
            <button className="signout-button" onClick={signOut}>
              <LogOut size={15} /> SIGN OUT
            </button>
          </div>
          <div className="profile-stats">
            <div>
              <span>CASE PROGRESS</span>
              <b>{progress}%</b>
            </div>
            <div>
              <span>EVIDENCE RECOVERED</span>
              <b>{found.length}/06</b>
            </div>
            <div>
              <span>INTERVIEWS LOGGED</span>
              <b>{questioned.length}/05</b>
            </div>
          </div>
          <button className="primary-button" onClick={startCase}>
            RESUME INVESTIGATION <ArrowRight size={16} />
          </button>
        </main>
      )}

      {view === 'classified' && (
        <main className="page-main classified-page">
          <div className="classified-seal">
            <Lock size={33} />
          </div>
          <div className="page-eyebrow">
            RESTRICTED ARCHIVE / CLEARANCE REQUIRED
          </div>
          <h1>
            YOU WEREN'T
            <br />
            <em>SUPPOSED TO FIND THIS.</em>
          </h1>
          <p>
            Some files are sealed for a reason. Complete your first
            investigation to reveal what lies beyond the signal.
          </p>
          <div className="classified-code">
            ARCHIVE NODE: UNKNOWN // ACCESS DENIED // TRACE ACTIVE
          </div>
          <button className="primary-button" onClick={startCase}>
            RETURN TO CASE 001 <ArrowRight size={16} />
          </button>
        </main>
      )}

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-mark">
            M<span>.</span>
          </span>
          <div>
            <b>MYSTERYBOX</b>
            <small>EVERY SECRET HAS A PRICE.</small>
          </div>
        </div>
        <div className="footer-center">
          AN INTERACTIVE MYSTERY EXPERIENCE <span>•</span> FICTIONAL UNIVERSE
        </div>
        <div className="footer-right">
          © 2026 MYSTERYBOX <span>ALL SIGNALS RESERVED</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
