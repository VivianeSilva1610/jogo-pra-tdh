import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  startGameSession,
  endGameSession,
  logGameEvent,
  getRecommendedDifficulty,
  getLastGameDifficulty,
  GameEvent,
} from '../services/database';

export const DIFFICULTY_LEVELS = ['facil', 'medio', 'dificil'] as const;
export type DifficultyLevel = 0 | 1 | 2;

function levelFromText(text: string | null): DifficultyLevel | null {
  if (!text) return null;
  const idx = DIFFICULTY_LEVELS.indexOf(text as (typeof DIFFICULTY_LEVELS)[number]);
  return idx === -1 ? null : (idx as DifficultyLevel);
}

type LoggableEvent = Omit<GameEvent, 'profile_id' | 'session_id' | 'game_key'>;

/**
 * Abre uma game_session para o minijogo, resolve o nível de dificuldade
 * adaptativa (baseado nas últimas 15 respostas via v_recommended_difficulty)
 * e expõe helpers para registrar eventos e encerrar a sessão.
 *
 * `difficulty` fica `null` enquanto a recomendação carrega — quem consome
 * deve esperar esse valor antes de montar a fila de exercícios, para não
 * começar com um nível e trocar no meio da primeira rodada.
 */
export function useGameSession(gameKey: string) {
  const { childId } = useGame();
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    endedRef.current = false;
    sessionIdRef.current = null;
    setDifficulty(null);

    if (!childId) return;

    (async () => {
      const [recommendation, lastDifficultyText] = await Promise.all([
        getRecommendedDifficulty(childId, gameKey),
        getLastGameDifficulty(childId, gameKey),
      ]);

      const lastLevel = levelFromText(lastDifficultyText) ?? 0;
      let newLevel: DifficultyLevel = lastLevel;
      if (recommendation === 'subir') newLevel = Math.min(2, lastLevel + 1) as DifficultyLevel;
      else if (recommendation === 'descer') newLevel = Math.max(0, lastLevel - 1) as DifficultyLevel;

      if (!isMounted) return;
      setDifficulty(newLevel);

      try {
        const id = await startGameSession(childId, gameKey, DIFFICULTY_LEVELS[newLevel]);
        if (isMounted) sessionIdRef.current = id;
      } catch (err) {
        console.warn(`Erro ao iniciar game_session (${gameKey}):`, err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [childId, gameKey]);

  const logEvent = (event: LoggableEvent) => {
    if (!childId || !sessionIdRef.current) return;
    logGameEvent({
      profile_id: childId,
      session_id: sessionIdRef.current,
      game_key: gameKey,
      ...event,
    }).catch((err) => console.warn(`Erro logGameEvent (${gameKey}):`, err));
  };

  const finishSession = (stars: number = 0) => {
    if (!childId || !sessionIdRef.current || endedRef.current) return;
    endedRef.current = true;
    logEvent({ event_type: 'activity_complete' });
    endGameSession(sessionIdRef.current, { stars }).catch((err) => console.warn(`Erro endGameSession (${gameKey}):`, err));
  };

  const abandonSession = () => {
    if (!childId || !sessionIdRef.current || endedRef.current) return;
    endedRef.current = true;
    logEvent({ event_type: 'abandon' });
    endGameSession(sessionIdRef.current).catch((err) => console.warn(`Erro endGameSession abandon (${gameKey}):`, err));
  };

  return { difficulty, logEvent, finishSession, abandonSession };
}
