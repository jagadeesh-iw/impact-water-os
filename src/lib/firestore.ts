import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type FirestoreRecord = {
  id: string;
  [key: string]: unknown;
};

const COLLECTIONS = [
  "projects",
  "tasks",
  "orders",
  "operations",
  "crm_campaigns",
  "growth_experiments",
  "website_items",
  "notes",
  "notifications",
] as const;

export type FirestoreCollection = (typeof COLLECTIONS)[number];

/**
 * Load every record from a Firestore collection.
 */
export async function getRecords(
  collectionName: FirestoreCollection
): Promise<FirestoreRecord[]> {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

/**
 * Create a new record with a generated Firestore document ID.
 */
export async function createRecord(
  collectionName: FirestoreCollection,
  data: Record<string, unknown>
): Promise<string> {
  const reference = doc(collection(db, collectionName));

  await setDoc(reference, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

/**
 * Create or completely replace a record using a specific ID.
 */
export async function setRecord(
  collectionName: FirestoreCollection,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await setDoc(
    doc(db, collectionName, id),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Update selected fields of an existing record.
 */
export async function updateRecord(
  collectionName: FirestoreCollection,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a record.
 */
export async function deleteRecord(
  collectionName: FirestoreCollection,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}
