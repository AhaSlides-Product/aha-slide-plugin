import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SubmissionPayload } from '@aha/common';
import { AnswerRequest } from '@aha/api';

type SubmissionUpsert = SubmissionPayload & { slideType: string }
type Submission = SubmissionUpsert & { id: number }

type AnswerUpsert = AnswerRequest & { slideType: string }
type Answer = AnswerUpsert & { id: number }

const DB_NAME = 'AhaSlides';
const STORE_NAME = 'submissions';
const ANSWER_STORE_NAME = 'answers';
const DB_VERSION = 2;
const slideIdSlideVersionAudienceIdIndex = 'slideId-slideVersion-audienceId';
const slideIdSlideVersionParticipantIdIndex = 'slideId-slideVersion-participantId';

interface AhaDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: Submission;
    indexes: {
      [slideIdSlideVersionAudienceIdIndex]: [number, number, string];
    };
  };
  [ANSWER_STORE_NAME]: {
    key: number;
    value: Answer;
    indexes: {
      [slideIdSlideVersionParticipantIdIndex]: [string, number, string];
    };
  };
}

/**
 * Returns a structured-clone-safe plain copy of a value.
 *
 * Slides build their payloads from Vue reactive state, and reactive Proxies
 * (arrays especially) cannot be handled by IndexedDB's structured-clone-based
 * `put`, which throws `DataCloneError: [object Array] could not be cloned`.
 * These payloads are plain JSON DTOs (the same shape sent to the API), so a
 * JSON round-trip both detaches the value and strips any reactivity Proxy,
 * without coupling this package to any UI framework.
 */
function toStorable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
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
      if (oldVersion < 2) {
        const store = db.createObjectStore(ANSWER_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex(slideIdSlideVersionParticipantIdIndex, ['slideId', 'slideVersion', 'participantId']);
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
  }).catch((err) => {
    dbPromise = null;
    throw err;
  });

  return dbPromise;
}

export async function saveSubmission(submission: SubmissionUpsert): Promise<number> {
  const db = await getDB();
  return db.put(STORE_NAME, toStorable(submission) as any);
}

export async function getSubmissions({ slideId, slideVersion, senderId }: { slideId: number, slideVersion: number, senderId: string }): Promise<Submission[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE_NAME, slideIdSlideVersionAudienceIdIndex, [slideId, slideVersion, senderId]);
}

export async function deleteSubmission(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function saveAnswer(answer: AnswerUpsert): Promise<number> {
  const db = await getDB();
  return db.put(ANSWER_STORE_NAME, toStorable(answer) as any);
}

export async function getAnswers({ slideId, slideVersion, participantId }: { slideId: string, slideVersion: number, participantId: string }): Promise<Answer[]> {
  const db = await getDB();
  return db.getAllFromIndex(ANSWER_STORE_NAME, slideIdSlideVersionParticipantIdIndex, [slideId, slideVersion, participantId]);
}

export async function deleteAnswer(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(ANSWER_STORE_NAME, id);
}

