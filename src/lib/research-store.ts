import { useEffect, useState, useCallback } from "react";

export type TabId =
  | "producto"
  | "buyer"
  | "geografia"
  | "edad"
  | "fomo"
  | "competencia"
  | "dolores"
  | "resumen";

export type FieldMap = Record<string, string>;
export type Avatar = FieldMap;
export type ResearchData = Record<string, FieldMap>;

// Informe generado en otra IA que el usuario adjunta (archivo o link de Drive)
export type ExternalReport = {
  kind: "file" | "link";
  name: string;
  mime?: string;
  data?: string; // base64 (solo para archivos)
  url?: string; // link de Drive u otro (solo para links)
  addedAt: number;
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  data: ResearchData;
  avatars: Avatar[]; // buyer personas
  photos: string[]; // fotos reales del producto / servicio (base64)
  report?: ExternalReport | null; // informe externo adjunto
};

export const MAX_PHOTOS = 10;

const KEY = "nixoia-pro-projects-v2";
const ACTIVE_KEY = "nixoia-pro-active-v2";
const LEGACY_KEY = "market-research-arcade-v1";

type Store = { projects: Project[]; activeId: string };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function newProject(name = "Investigación 1"): Project {
  const now = Date.now();
  return { id: uid(), name, createdAt: now, updatedAt: now, data: {}, avatars: [], photos: [] };
}

function load(): Store {
  if (typeof window === "undefined") return { projects: [newProject()], activeId: "" };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Store;
      if (parsed.projects?.length) {
        return {
          projects: parsed.projects.map((p) => ({ ...p, avatars: p.avatars || [], photos: p.photos || [] })),
          activeId: parsed.activeId || parsed.projects[0].id,
        };
      }
    }
    // migrate legacy single store
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const data = JSON.parse(legacy) as ResearchData;
      const p = newProject("Mi primera investigación");
      p.data = data;
      return { projects: [p], activeId: p.id };
    }
  } catch {}
  const p = newProject();
  return { projects: [p], activeId: p.id };
}

export function useResearch() {
  const [store, setStore] = useState<Store>(() => ({ projects: [], activeId: "" }));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStore(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && store.projects.length) {
      localStorage.setItem(KEY, JSON.stringify(store));
      localStorage.setItem(ACTIVE_KEY, store.activeId);
    }
  }, [store, loaded]);

  const active = store.projects.find((p) => p.id === store.activeId) || store.projects[0];

  const mutateActive = useCallback(
    (fn: (p: Project) => Project) =>
      setStore((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === s.activeId ? { ...fn(p), updatedAt: Date.now() } : p)),
      })),
    [],
  );

  const updateField = useCallback(
    (tab: string, field: string, value: string) =>
      mutateActive((p) => ({ ...p, data: { ...p.data, [tab]: { ...(p.data[tab] || {}), [field]: value } } })),
    [mutateActive],
  );

  const setAvatars = useCallback(
    (avatars: Avatar[]) => mutateActive((p) => ({ ...p, avatars })),
    [mutateActive],
  );

  const updateAvatar = useCallback(
    (i: number, field: string, value: string) =>
      mutateActive((p) => {
        const arr = [...p.avatars];
        arr[i] = { ...(arr[i] || {}), [field]: value };
        return { ...p, avatars: arr };
      }),
    [mutateActive],
  );

  const addAvatars = useCallback(
    (newOnes: Avatar[]) => mutateActive((p) => ({ ...p, avatars: [...p.avatars, ...newOnes] })),
    [mutateActive],
  );

  const removeAvatar = useCallback(
    (i: number) => mutateActive((p) => ({ ...p, avatars: p.avatars.filter((_, idx) => idx !== i) })),
    [mutateActive],
  );

  const addPhotos = useCallback(
    (newOnes: string[]) =>
      mutateActive((p) => ({ ...p, photos: [...(p.photos || []), ...newOnes].slice(0, MAX_PHOTOS) })),
    [mutateActive],
  );

  const removePhoto = useCallback(
    (i: number) => mutateActive((p) => ({ ...p, photos: (p.photos || []).filter((_, idx) => idx !== i) })),
    [mutateActive],
  );

  const setReport = useCallback(
    (report: ExternalReport | null) => mutateActive((p) => ({ ...p, report })),
    [mutateActive],
  );

  const resetActive = () => mutateActive((p) => ({ ...p, data: {}, avatars: [], photos: [], report: null }));

  const createProject = (name?: string) =>
    setStore((s) => {
      const p = newProject(name || `Investigación ${s.projects.length + 1}`);
      return { projects: [...s.projects, p], activeId: p.id };
    });

  const switchProject = (id: string) => setStore((s) => ({ ...s, activeId: id }));

  const renameProject = (id: string, name: string) =>
    setStore((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)),
    }));

  const deleteProject = (id: string) =>
    setStore((s) => {
      const projects = s.projects.filter((p) => p.id !== id);
      const fallback = projects[0] || newProject();
      return { projects: projects.length ? projects : [fallback], activeId: (projects[0] || fallback).id };
    });

  return {
    loaded,
    projects: store.projects,
    activeId: store.activeId,
    project: active,
    data: active?.data || {},
    avatars: active?.avatars || [],
    photos: active?.photos || [],
    report: active?.report || null,
    updateField,
    setAvatars,
    updateAvatar,
    addAvatars,
    removeAvatar,
    addPhotos,
    removePhoto,
    setReport,
    resetActive,
    createProject,
    switchProject,
    renameProject,
    deleteProject,
  };
}

export function tabProgress(tabData: FieldMap | undefined, total: number) {
  if (!tabData || !total) return 0;
  const filled = Object.values(tabData).filter((v) => v && v.trim().length > 5).length;
  return Math.min(100, Math.round((filled / total) * 100));
}

export function avatarsProgress(avatars: Avatar[], totalFields: number) {
  if (!avatars.length) return 0;
  const score =
    avatars.reduce((s, a) => s + Object.values(a).filter((v) => v && v.trim().length > 3).length, 0) /
    (avatars.length * totalFields);
  return Math.min(100, Math.round(score * 100));
}
