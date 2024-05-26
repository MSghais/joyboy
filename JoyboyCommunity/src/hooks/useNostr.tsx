import NDK, {NDKNip07Signer} from '@nostr-dev-kit/ndk';
import {
  Filter,
  finalizeEvent,
  NostrEvent,
  parseReferences,
  Relay,
  SimplePool,
  VerifiedEvent,
  verifyEvent,
} from 'nostr-tools';
import {useMemo, useState} from 'react';

import {JOYBOY_RELAYS, RELAYS_PROD} from '../utils/relay';

export const useNostr = () => {
  const pool = new SimplePool();
  const relays = RELAYS_PROD;
  const nip07signer = new NDKNip07Signer();
  const ndk = new NDK({signer: nip07signer});

  const [eventsData, setEventsData] = useState<NostrEvent[]>([]);
  const [eventsUser, setEventsUser] = useState<NostrEvent[]>([]);
  const [isReady, setIsReady] = useState(false);

  /** fix memo reload */
  const events = useMemo(() => {
    return eventsData;
  }, [eventsData]);

  const setEvents = (eventsData?: NostrEvent[]) => {
    setEventsData(eventsData);
  };

  const getEvents = async (isSetEvents?: boolean) => {
    const events = await pool.querySync(relays, {kinds: [0, 1]}, {});
    if (isSetEvents) {
      setEventsData(events);
    }
    return events;
  };

  const getEventsNotes = async (isSetEvents?: boolean) => {
    const eventsNotes = await pool.querySync(relays, {kinds: [1]});
    if (isSetEvents) {
      setEventsData(eventsNotes);
    }
    return eventsNotes;
  };

  const getEventsUser = async (isSetEvents?: boolean) => {
    const eventsUser = await pool.querySync(relays, {kinds: [0]});
    if (isSetEvents) {
      setEventsUser(eventsUser);
    }
    return eventsUser;
  };

  const parsingEventContent = (event?: NostrEvent) => {
    try {
      const references = parseReferences(event);
      const simpleAugmentedContent = event.content;

      let profilesCache;
      let eventsCache;
      for (let i = 0; i < references.length; i++) {
        const {text, profile, event, address} = references[i];
        const augmentedReference = profile ? (
          <strong>@${profilesCache[profile.pubkey].name}</strong>
        ) : event ? (
          <em>${eventsCache[event.id].content.slice(0, 5)}</em>
        ) : address ? (
          <a href="${text}">[link]</a>
        ) : (
          text
        );
        // simpleAugmentedContent.replaceAll(text, augmentedReference);
        simpleAugmentedContent.replaceAll(text, augmentedReference?.toString());
      }

      return simpleAugmentedContent;
    } catch (e) {}
  };

  /** @TODO finish Give NIP05 parsed content */
  const parsingNip05EventContent = (event?: NostrEvent) => {
    try {
      const references = parseReferences(event);
      const simpleAugmentedContent = event.content;
      let profilesCache;
      const stringify = JSON.parse(simpleAugmentedContent);
      return stringify;
    } catch (e) {}
  };

  const getEvent = async (id: string) => {
    try {
      const event = await pool.get(relays, {
        ids: [id],
      });
      return event;
    } catch (e) {}
  };

  const getUser = async (pubkey: string, isSetEvents?: boolean) => {
    try {
      const user = await ndk.getUser({
        pubkey,
      });
      // return await queryProfile(id);
      return user;
    } catch (e) {
      console.log('error getUser', e);
    }
  };

  const getEventsByQuery = async (
    ids: string[] = ['1', '3'],
    filter?: Filter,
    relaysProps?: string[],
  ) => {
    try {
      const events = await pool.querySync(relaysProps ?? relays, {
        ids,
        ...filter,
      });
      return events;
    } catch (e) {
      console.log('error getEventsByQuery', e);
    }
  };

  const getUserQuery = async (pubkey: string, id = '0', isSetEvents?: boolean) => {
    try {
      const events = await pool.get(relays, {
        kinds: [Number(id)],
        authors: [pubkey],
      });
      return events;
      // return await queryProfile(pubkey);
    } catch (e) {
      console.log('error getUserQuery', e);
    }
  };

  const getEventsNotesFromPubkey = async (
    pubkey: string,
    kinds?: number[],
    relaysUser?: string[],
    isSetEvents?: boolean,
  ) => {
    try {
      const events = await pool.querySync(relaysUser ?? relays, {
        kinds: kinds ?? [1],
        authors: [pubkey],
      });
      if (isSetEvents) {
        setEventsData(events);
      }
      return events;
    } catch (e) {
      console.log('error getUser', e);
    }
  };

  const getEventsFromPubkey = async (
    pubkey: string,
    relaysUser?: string[],
    isSetEvents?: boolean,
    kinds?: number[],
  ) => {
    try {
      const events = await pool.querySync(relaysUser ?? relays, {
        kinds: kinds ?? [1, 3],
        authors: [pubkey],
      });
      if (isSetEvents) {
        setEventsData(events);
      }
      return events;
    } catch (e) {
      console.log('error getUser', e);
    }
  };

  const sendNote = async (
    sk: Uint8Array,
    content: string,
    tags?: string[][],
  ): Promise<{
    event?: VerifiedEvent;
    isValid?: boolean;
    published?: Promise<string>[];
  }> => {
    try {
      const event = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: tags ?? [],
          content,
        },
        sk,
      );
      console.log('event', event);

      const isGood = verifyEvent(event);

      if (!isGood) {
        return {
          event,
          isValid: false,
        };
      }
      console.log('isGood', isGood);

      let eventPublish = await pool.publish(JOYBOY_RELAYS, event);
      console.log('eventPublish', eventPublish);

      return {
        event,
        isValid: true,
        published:eventPublish
      };
    } catch (e) {
      console.log('issue sendNote', e);
      return {
        event: undefined,
        isValid: false,
      };
    }
  };

  return {
    pool,
    getEvents,
    getEvent,
    parseReferences,
    setEvents,
    events,
    parsingEventContent,
    getEventsNotes,
    getEventsUser,
    relays,
    eventsData,
    parsingNip05EventContent,
    getUser,
    getEventsNotesFromPubkey,
    sendNote,
    getUserQuery,
    getEventsFromPubkey,
    getEventsByQuery,
  };
};
