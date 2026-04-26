import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./auth";

export type CampaignChannel = "sms" | "whatsapp" | "both";
export type CampaignStatus = "completed" | "partial" | "failed";

export type Campaign = {
  id: string;
  title: string;
  message: string;
  dltTemplateId?: string;
  channel: CampaignChannel;
  totalContacts: number;
  sent: number;
  failed: number;
  status: CampaignStatus;
  createdAt: number;
};

export type UsageStats = {
  totalSent: number;
  totalFailed: number;
  campaignsRun: number;
  // SMS quota is 90/day per SIM (telecom limit)
  todaySent: number;
  quotaPerDay: number;
};

type CampaignsContextType = {
  campaigns: Campaign[];
  stats: UsageStats;
  isLoading: boolean;
  addCampaign: (
    data: Omit<Campaign, "id" | "createdAt" | "status">
  ) => Promise<string>;
};

const CampaignsContext = createContext<CampaignsContextType | null>(null);

const DEFAULT_QUOTA = 90;

export function useCampaigns() {
  const ctx = useContext(CampaignsContext);
  if (!ctx) {
    return {
      campaigns: [],
      stats: {
        totalSent: 0,
        totalFailed: 0,
        campaignsRun: 0,
        todaySent: 0,
        quotaPerDay: DEFAULT_QUOTA,
      },
      isLoading: true,
      addCampaign: async () => "",
    };
  }
  return ctx;
}

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<UsageStats>({
    totalSent: 0,
    totalFailed: 0,
    campaignsRun: 0,
    todaySent: 0,
    quotaPerDay: DEFAULT_QUOTA,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for campaigns
  useEffect(() => {
    if (!user) {
      setCampaigns([]);
      setIsLoading(false);
      return;
    }

    const campaignsRef = collection(db, "users", user.id, "campaigns");
    const q = query(campaignsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Campaign[] = snapshot.docs.map((d) => ({
          id: d.id,
          title: d.data().title || "",
          message: d.data().message || "",
          dltTemplateId: d.data().dltTemplateId || "",
          channel: d.data().channel || "sms",
          totalContacts: d.data().totalContacts || 0,
          sent: d.data().sent || 0,
          failed: d.data().failed || 0,
          status: d.data().status || "completed",
          createdAt: d.data().createdAt || 0,
        }));
        setCampaigns(list);

        // Compute aggregate stats
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayTs = todayStart.getTime();

        const agg = list.reduce(
          (acc, c) => {
            acc.totalSent += c.sent;
            acc.totalFailed += c.failed;
            acc.campaignsRun += 1;
            if (c.createdAt >= todayTs) {
              acc.todaySent += c.sent;
            }
            return acc;
          },
          { totalSent: 0, totalFailed: 0, campaignsRun: 0, todaySent: 0 }
        );

        setStats({
          ...agg,
          quotaPerDay: DEFAULT_QUOTA,
        });
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to campaigns:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addCampaign = useCallback(
    async (data: Omit<Campaign, "id" | "createdAt" | "status">) => {
      if (!user) throw new Error("Not authenticated");

      const status: CampaignStatus =
        data.failed === 0
          ? "completed"
          : data.sent === 0
          ? "failed"
          : "partial";

      const campaignsRef = collection(db, "users", user.id, "campaigns");
      const ref = await addDoc(campaignsRef, {
        ...data,
        status,
        createdAt: Date.now(),
      });
      return ref.id;
    },
    [user]
  );

  return (
    <CampaignsContext.Provider value={{ campaigns, stats, isLoading, addCampaign }}>
      {children}
    </CampaignsContext.Provider>
  );
}
