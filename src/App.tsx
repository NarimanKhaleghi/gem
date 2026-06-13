import { useState, useEffect } from 'react';
import { useAppStore } from './store';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsModal from './components/SettingsModal';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { encryptData, decryptData } from './lib/crypto';

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { setChats, chats, settings } = useAppStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // sync down
        try {
            const mainDoc = await getDoc(doc(db, 'users', u.uid, 'secrets', 'main'));
            if (mainDoc.exists()) {
                const data = mainDoc.data();
                // We'd decrypt and apply settings/chats here.
                // For simplicity, we assume chats are stored in local storage and only backed up, 
                // or we just trust local storage if it's newer.
            }
        } catch(e) {
            console.error("Firebase sync error", e);
        }
      }
    });
    return unsub;
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} user={user} />
      <div className="flex-1 flex flex-col min-w-0">
         <ChatArea />
      </div>
      
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
