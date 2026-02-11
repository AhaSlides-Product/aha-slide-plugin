import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SubmissionPayload } from '@aha/common';

type SubmissionUpsert = SubmissionPayload & { slideType: string }

const DB_NAME = 'AhaSlides';
const STORE_NAME = 'submissions';
const DB_VERSION = 1;
const slideIdSlideVersionAudienceIdIndex = 'slideId-slideVersion-audienceId';

interface AhaDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: SubmissionUpsert;
    indexes: {
      [slideIdSlideVersionAudienceIdIndex]: [number, number, string];
    };
  };
}

let dbPromise: Promise<IDBPDatabase<AhaDB>> | null = null;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = openDB<AhaDB>(DB_NAME, DB_VERSION, {
    upgrade(db: IDBPDatabase<AhaDB>, oldVersion: number) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex(slideIdSlideVersionAudienceIdIndex, ['slideId', 'slideVersion', 'senderId']);
      }
    },
    blocked() {
      // This happens if another tab is using an older version of the database
      // and won't close it, preventing this tab from upgrading.
      console.warn('IndexedDB upgrade blocked: Please close other tabs running this app.');
    },
    blocking() {
      // This happens if another tab is trying to upgrade the database.
      // We should close our connection to allow it to proceed.
      if (dbPromise) {
        dbPromise.then((db) => db.close());
        dbPromise = null;
      }
    },
    terminated() {
      // This happens if the browser closes the database unexpectedly.
      dbPromise = null;
    },
  });

  return dbPromise;
}

export async function saveSubmission(submission: SubmissionUpsert): Promise<number> {
  const db = await getDB();
  return db.put(STORE_NAME, submission);
}

export async function getSubmissions({ slideId, slideVersion, senderId }: { slideId: number, slideVersion: number, senderId: string }): Promise<SubmissionUpsert[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE_NAME, slideIdSlideVersionAudienceIdIndex, [slideId, slideVersion, senderId]);
}
