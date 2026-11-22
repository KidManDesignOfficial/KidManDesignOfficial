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
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.14)',
          backgroundColor: CLUB_COLORS.blueDark,
        },
        // Opak degrade: arkadaki stadyum sahnesi kartın içine sızıp rengi bulandırmasın.
        inner: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 16, gap: 16 },
        stripe: { flexDirection: 'row', height: 4 },
        stripeGreen: { flex: 1, backgroundColor: CLUB_COLORS.green },
        stripeBlue: { flex: 1, backgroundColor: '#2F7BEA' },
        // Saha çizgisi motifi: orta çizgi + orta yuvarlak, yazıların arkasında çok silik.
        pitchLine: { position: 'absolute', top: 0, height: 236, left: '50%', width: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
        pitchCircle: {
          position: 'absolute',
          left: '50%',
          top: 46,
          width: 128,
          height: 128,
          marginLeft: -64,
          borderRadius: 64,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.07)',
        },
        top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
        chipText: { color: '#FFFFFF', fontSize: fs(11), fontWeight: '800', letterSpacing: 1.2 },
        league: { color: 'rgba(255,255,255,0.6)', fontSize: fs(12), fontWeight: '700' },
        liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,59,48,0.9)' },
        liveText: { color: '#FFFFFF', fontSize: fs(11), fontWeight: '900', letterSpacing: 1.2 },
        teams: { flexDirection: 'row', alignItems: 'flex-start' },
        team: { flex: 1, alignItems: 'center', gap: 8 },
        crest: {
          width: 58,
          height: 58,
          borderRadius: 29,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          borderWidth: 3,
          borderColor: 'rgba(255,255,255,0.25)',
        },
        crestUs: { borderColor: CLUB_COLORS.green },
        crestText: { color: CLUB_COLORS.blueDark, fontSize: fs(15), fontWeight: '900' },
        crestTextUs: { color: CLUB_COLORS.greenDark },
        teamName: { color: '#FFFFFF', fontSize: fs(14), fontWeight: '800', textAlign: 'center', lineHeight: fs(18) },
        side: { color: 'rgba(255,255,255,0.55)', fontSize: fs(11), fontWeight: '600', marginTop: -4 },
        center: { width: fs(112), alignItems: 'center', paddingTop: 6, gap: 2 },
        time: { color: '#FFFFFF', fontSize: fs(30), fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: 0.5 },
        day: { color: 'rgba(255,255,255,0.75)', fontSize: fs(12), fontWeight: '700', textAlign: 'center' },
        score: { color: '#FFFFFF', fontSize: fs(38), fontWeight: '900', letterSpacing: 1, fontVariant: ['tabular-nums'] },
        status: { color: 'rgba(255,255,255,0.85)', fontSize: fs(12), fontWeight: '700' },
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
          backgroundColor: 'rgba(0,0,0,0.25)',
        },
        kickoffSoonText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '800' },
        // Geri sayım tek bir koyu şerit: dört ayrı kutu yerine sakin, okunaklı bir satır.
        countdown: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: 'rgba(0,0,0,0.25)',
        },
        cdGroup: { flexDirection: 'row', alignItems: 'center' },
        cdCell: { alignItems: 'center', minWidth: fs(52) },
        cdNum: { color: '#FFFFFF', fontSize: fs(22), fontWeight: '900', fontVariant: ['tabular-nums'] },
        cdLabel: { color: 'rgba(255,255,255,0.55)', fontSize: fs(10), fontWeight: '800', letterSpacing: 0.8 },
        cdSep: { color: 'rgba(255,255,255,0.3)', fontSize: fs(20), fontWeight: '800', marginBottom: fs(12) },
        venue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: -4 },
        venueText: { color: 'rgba(255,255,255,0.72)', fontSize: fs(12), fontWeight: '600', flexShrink: 1 },
        actions: { flexDirection: 'row', gap: 8 },
        btnWrap: { flex: 1 },
        btn: {
          alignItems: 'center',
          paddingVertical: 11,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.22)',
        },
        btnOn: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
        btnText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '800' },
        btnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        btnTextOn: { color: CLUB_COLORS.greenDark },
      }),
    [fs],
  );

  const cd = countdownParts(match.date.getTime() - now);
  // "Cuma, 27 Kas · 20:00" → gün ve saat ayrı satırlarda (saat büyük).
  const [dayText, timeText] = longKickoff(match.date, new Date(now)).split(' · ');
  const crest = (id: string, abbr: string) => (
    <View style={[styles.crest, id === RIZESPOR_ID && styles.crestUs]}>
      <Text style={[styles.crestText, id === RIZESPOR_ID && styles.crestTextUs]}>{id === RIZESPOR_ID ? 'ÇRS' : abbr.slice(0, 3) || '?'}</Text>
    </View>
  );

  return (
    <PressableScale onPress={onOpen} scaleTo={0.985} containerStyle={styles.card} accessibilityRole="button" accessibilityLabel="Maç merkezini aç">
      <View style={styles.stripe}>
        <View style={styles.stripeGreen} />
        <View style={styles.stripeBlue} />
      </View>
      <LinearGradient colors={[CLUB_COLORS.greenDark, '#0A3550', CLUB_COLORS.blueDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inner}>
        <View style={styles.pitchLine} pointerEvents="none" />
        <View style={styles.pitchCircle} pointerEvents="none" />
        <View style={styles.top}>
          {mode === 'live' ? (
            <View style={styles.liveRow}>
              <LivePulse color="#FFFFFF" size={7} />
              <Text style={styles.liveText}>CANLI</Text>
            </View>
          ) : (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{mode === 'next' ? 'SIRADAKİ MAÇ' : 'SON MAÇ'}</Text>
            </View>
          )}
          <Text style={styles.league}>Süper Lig</Text>
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
              <>
                <Text style={styles.time}>{timeText}</Text>
                <Text style={styles.day}>{dayText}</Text>
              </>
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
            {(
              [
                [cd.days, 'GÜN'],
                [cd.hours, 'SAAT'],
                [cd.minutes, 'DK'],
                [cd.seconds, 'SN'],
              ] as const
            ).map(([n, l], i) => (
              <View key={l} style={styles.cdGroup}>
                {i > 0 ? <Text style={styles.cdSep}>:</Text> : null}
                <View style={styles.cdCell}>
                  <Text style={styles.cdNum}>{String(n).padStart(2, '0')}</Text>
                  <Text style={styles.cdLabel}>{l}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {mode !== 'next' || match.venue ? (
          <View style={styles.venue}>
            <Icon name={mode === 'next' ? 'location-outline' : 'calendar-outline'} size={14} color="rgba(255,255,255,0.72)" />
            <Text style={styles.venueText} numberOfLines={1}>
              {mode === 'next' ? match.venue : `${dayText} · ${timeText}${match.venue ? ` · ${match.venue}` : ''}`}
            </Text>
          </View>
        ) : null}

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
