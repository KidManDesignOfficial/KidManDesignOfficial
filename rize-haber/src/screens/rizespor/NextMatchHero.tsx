import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/motion';
import { pressFeedback, successFeedback } from '../../haptics';
import { setMatchFeature } from '../../notifications';
import { countdownParts, longKickoff } from '../../rizespor/format';
import { liveMinute, matchProgress } from '../../rizespor/live';
import { CLUB_COLORS, RIZESPOR_ID } from '../../rizespor/names';
import type { Match } from '../../rizespor/parse';
import { REMINDER_MINUTES, getMatchSettings } from '../../rizespor/reminders';
import { useTheme } from '../../theme';
import { LivePulse, ProgressBar, ResultPill, useNow } from './shared';

export default function NextMatchHero({
  match,
  mode,
  dataAt,
  onOpen,
}: {
  match: Match;
  mode: 'next' | 'live' | 'last';
  /** Verinin geldiği an: canlı dakika bundan sonra telefonda ilerletilir. */
  dataAt: number;
  onOpen: () => void;
}) {
  const { fs } = useTheme();
  // Geri sayım ve canlı dakika saniyede bir; son maç kartı durağan.
  const now = useNow(1000, mode === 'next' || (mode === 'live' && match.running));
  const [reminders, setReminders] = useState<boolean | null>(null);

  useEffect(() => {
    getMatchSettings().then((s) => setReminders(s.reminders));
  }, []);

  const toggleReminder = async () => {
    pressFeedback();
    const next = !reminders;
    const result = await setMatchFeature('reminders', next).catch(() => 'error' as const);
    if (result === 'enabled') {
      setReminders(next);
      if (next) {
        successFeedback();
        Alert.alert(
          '🍵 Hatırlatma açıldı',
          `Rizespor maçlarından ${REMINDER_MINUTES} dakika önce “Çayını demle, maç başlıyor!” bildirimi alacaksınız.`,
        );
      }
    } else if (result === 'permission-denied') {
      Alert.alert('Bildirim izni gerekli', 'Hatırlatma için telefon ayarlarından bildirim izni verin.', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Ayarları aç', onPress: () => Linking.openSettings() },
      ]);
    } else {
      Alert.alert('Bir sorun oluştu', 'Hatırlatma ayarlanamadı. Lütfen tekrar deneyin.');
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          marginHorizontal: 16,
          marginTop: 12,
          borderRadius: 22,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.22)',
        },
        inner: { padding: 18, gap: 14 },
        // Kartın sağ üstünde iri, silik bir top: stadyum sahnesiyle aynı dili konuşur.
        watermark: { position: 'absolute', right: -34, top: -30, opacity: 0.12, transform: [{ rotate: '-18deg' }] },
        shine: { position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
        top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        label: { color: 'rgba(255,255,255,0.85)', fontSize: fs(12), fontWeight: '800', letterSpacing: 1 },
        liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        liveText: { color: '#FFFFFF', fontSize: fs(12), fontWeight: '900', letterSpacing: 1 },
        teams: { flexDirection: 'row', alignItems: 'center' },
        team: { flex: 1, alignItems: 'center', gap: 4 },
        crest: {
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.16)',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.35)',
        },
        crestUs: { backgroundColor: '#FFFFFF' },
        crestText: { color: '#FFFFFF', fontSize: fs(15), fontWeight: '900' },
        crestTextUs: { color: CLUB_COLORS.greenDark },
        teamName: { color: '#FFFFFF', fontSize: fs(14), fontWeight: '800', textAlign: 'center' },
        side: { color: 'rgba(255,255,255,0.7)', fontSize: fs(11), fontWeight: '600' },
        center: { width: fs(118), alignItems: 'center', gap: 2 },
        score: { color: '#FFFFFF', fontSize: fs(40), fontWeight: '900', letterSpacing: 1 },
        vs: { color: 'rgba(255,255,255,0.85)', fontSize: fs(15), fontWeight: '800' },
        status: { color: 'rgba(255,255,255,0.9)', fontSize: fs(13), fontWeight: '700' },
        liveMinute: {
          color: '#FFFFFF',
          fontWeight: '900',
          fontVariant: ['tabular-nums'],
          paddingHorizontal: 10,
          paddingVertical: 2,
          borderRadius: 999,
          overflow: 'hidden',
          backgroundColor: 'rgba(255,59,48,0.9)',
        },
        kickoffSoon: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: 'rgba(0,0,0,0.2)',
        },
        kickoffSoonText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '800' },
        countdown: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
        cdBox: {
          minWidth: 48,
          alignItems: 'center',
          paddingVertical: 6,
          borderRadius: 10,
          backgroundColor: 'rgba(0,0,0,0.18)',
        },
        cdNum: { color: '#FFFFFF', fontSize: fs(20), fontWeight: '900', fontVariant: ['tabular-nums'] },
        cdLabel: { color: 'rgba(255,255,255,0.75)', fontSize: fs(10), fontWeight: '700' },
        meta: { color: 'rgba(255,255,255,0.88)', fontSize: fs(13), textAlign: 'center' },
        actions: { flexDirection: 'row', gap: 8 },
        btnWrap: { flex: 1 },
        btn: {
          alignItems: 'center',
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
        },
        btnOn: { backgroundColor: '#FFFFFF' },
        btnText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '800' },
        btnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        btnTextOn: { color: CLUB_COLORS.greenDark },
      }),
    [fs],
  );

  const cd = countdownParts(match.date.getTime() - now);
  const crest = (id: string, abbr: string) => (
    <View style={[styles.crest, id === RIZESPOR_ID && styles.crestUs]}>
      <Text style={[styles.crestText, id === RIZESPOR_ID && styles.crestTextUs]}>{abbr.slice(0, 3) || '?'}</Text>
    </View>
  );

  return (
    <PressableScale onPress={onOpen} scaleTo={0.985} containerStyle={styles.card} accessibilityRole="button" accessibilityLabel="Maç merkezini aç">
      <LinearGradient
        colors={[`${CLUB_COLORS.green}D9`, `${CLUB_COLORS.blue}C7`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.watermark} pointerEvents="none">
          <Icon name="football" size={170} color="#FFFFFF" />
        </View>
        <View style={styles.shine} pointerEvents="none" />
        <View style={styles.top}>
          {mode === 'live' ? (
            <View style={styles.liveRow}>
              <LivePulse color="#FFFFFF" />
              <Text style={styles.liveText}>CANLI</Text>
            </View>
          ) : (
            <Text style={styles.label}>{mode === 'next' ? 'SIRADAKİ MAÇ' : 'SON MAÇ'}</Text>
          )}
          <Text style={styles.label}>SÜPER LİG</Text>
        </View>

        <View style={styles.teams}>
          <View style={styles.team}>
            {crest(match.home.id, match.home.abbr)}
            <Text style={styles.teamName} numberOfLines={2}>
              {match.home.name}
            </Text>
            <Text style={styles.side}>Ev sahibi</Text>
          </View>
          <View style={styles.center}>
            {mode === 'next' ? (
              <Text style={styles.vs}>VS</Text>
            ) : (
              <Text style={styles.score}>
                {match.homeScore ?? 0} - {match.awayScore ?? 0}
              </Text>
            )}
            {mode === 'live' ? <Text style={[styles.status, styles.liveMinute]}>{liveMinute(match, now - dataAt)}</Text> : null}
            {mode === 'last' ? <Text style={styles.status}>{match.status}</Text> : null}
            {mode === 'last' && match.result ? <ResultPill result={match.result} size={24} /> : null}
          </View>
          <View style={styles.team}>
            {crest(match.away.id, match.away.abbr)}
            <Text style={styles.teamName} numberOfLines={2}>
              {match.away.name}
            </Text>
            <Text style={styles.side}>Deplasman</Text>
          </View>
        </View>

        {mode === 'live' ? <ProgressBar progress={matchProgress(match, now - dataAt)} /> : null}

        {mode === 'next' && match.date.getTime() <= now ? (
          <View style={styles.kickoffSoon}>
            <LivePulse color="#FFFFFF" size={8} />
            <Text style={styles.kickoffSoonText}>Başlama düdüğü bekleniyor · skor burada canlı akacak</Text>
          </View>
        ) : mode === 'next' ? (
          <View style={styles.countdown} accessibilityLabel={`Maça ${cd.days} gün ${cd.hours} saat ${cd.minutes} dakika kaldı`}>
            {[
              [cd.days, 'GÜN'],
              [cd.hours, 'SAAT'],
              [cd.minutes, 'DK'],
              [cd.seconds, 'SN'],
            ].map(([n, l]) => (
              <View key={l} style={styles.cdBox}>
                <Text style={styles.cdNum}>{String(n).padStart(2, '0')}</Text>
                <Text style={styles.cdLabel}>{l}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.meta}>
          🗓️ {longKickoff(match.date)}
          {match.venue ? `\n📍 ${match.venue}` : ''}
        </Text>

        <View style={styles.actions}>
          {mode === 'next' && reminders !== null ? (
            <PressableScale
              onPress={toggleReminder}
              style={[styles.btn, reminders && styles.btnOn]}
              containerStyle={styles.btnWrap}
              accessibilityRole="switch"
              accessibilityState={{ checked: reminders }}
            >
              <View style={styles.btnInner}>
                <Icon name={reminders ? 'notifications' : 'notifications-outline'} size={16} color={reminders ? CLUB_COLORS.greenDark : '#FFFFFF'} />
                <Text style={[styles.btnText, reminders && styles.btnTextOn]}>{reminders ? 'Hatırlatma açık' : 'Bana hatırlat'}</Text>
              </View>
            </PressableScale>
          ) : null}
          <PressableScale onPress={onOpen} style={styles.btn} containerStyle={styles.btnWrap} accessibilityRole="button">
            <View style={styles.btnInner}>
              <Icon name={mode === 'live' ? 'pulse-outline' : 'stats-chart'} size={16} color="#FFFFFF" />
              <Text style={styles.btnText}>{mode === 'live' ? 'Canlı takip et' : 'Maç merkezi'}</Text>
            </View>
          </PressableScale>
        </View>
      </LinearGradient>
    </PressableScale>
  );
}
