import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, hasApiConfiguration } from '../../lib/api';

const fallbackPhoto = require('../../components/images/profile.png');

export default function MatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [likes, setLikes] = useState([]);
  const load = useCallback(async () => {
    try {
      const [matchResult, conversationResult, likeResult] = await Promise.all([api.getMatches(), api.getConversations(), api.getLikes()]);
      setMatches(matchResult.matches || []);
      setConversations(conversationResult.conversations || []);
      setLikes(likeResult.likes || []);
    } catch (error) {
      if (hasApiConfiguration()) Alert.alert('Messages unavailable', error.message);
    }
  }, []);
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, [load]);

  const openChat = (item) => router.push({
    pathname: '/chat/[id]',
    params: { id: String(item.conversationId || item.id), name: item.name || 'Your match', photo: item.photoUrl || '' },
  });
  const likeBack = async (person) => {
    try {
      const result = await api.swipe(person.id, 'like');
      setLikes((items) => items.filter((item) => item.id !== person.id));
      if (result.match) {
        router.push({ pathname: '/match', params: { id: result.match.id, conversationId: result.match.conversationId, name: person.name, photo: person.photoUrl || '' } });
        await load();
      }
    } catch (error) { Alert.alert('Could not save your like', error.message); }
  };

  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.content}>
    <Text style={s.kicker}>YOUR PEOPLE</Text><Text style={s.title}>Mates & chats</Text><Text style={s.sub}>Every good connection starts somewhere.</Text>
    {likes.length > 0 && <><View style={s.sectionRow}><Text style={s.section}>Liked you</Text><Text style={s.count}>{likes.length}</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.matchList}>{likes.map((item) => <View key={item.id} style={s.incoming}><Pressable onPress={() => router.push({ pathname: '/profile/[id]', params: { id: String(item.id) } })}><Image source={item.photoUrl ? { uri: item.photoUrl } : fallbackPhoto} style={s.avatar} /><Text style={s.matchName} numberOfLines={1}>{item.name}, {item.age}</Text></Pressable><Pressable style={s.likeBack} onPress={() => likeBack(item)} accessibilityLabel={`Like ${item.name} back`}><Ionicons name="heart" size={17} color="#FFF" /></Pressable></View>)}</ScrollView></>}
    <View style={s.sectionRow}><Text style={s.section}>New matches</Text><Text style={s.count}>{matches.length}</Text></View>
    {matches.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.matchList}>{matches.map((item) => <Pressable key={item.id} style={s.match} onPress={() => openChat(item)}><Image source={item.photoUrl ? { uri: item.photoUrl } : fallbackPhoto} style={s.avatar} /><Text style={s.matchName} numberOfLines={1}>{item.name}</Text></Pressable>)}</ScrollView> : <View style={s.emptyMatch}><View style={s.heart}><Ionicons name="heart-outline" size={21} color="#EF7180" /></View><View style={{ flex: 1 }}><Text style={s.emptyTitle}>Your next match is out there</Text><Text style={s.emptyText}>Like someone in Discover. When you both like each other, you’ll meet here.</Text></View></View>}
    <View style={s.sectionRow}><Text style={s.section}>Conversations</Text><Pressable onPress={load}><Ionicons name="refresh" size={17} color="#EF7180" /></Pressable></View>
    {conversations.length ? conversations.map((item) => <Pressable key={item.id} style={s.convo} onPress={() => openChat(item)}><Image source={item.photoUrl ? { uri: item.photoUrl } : fallbackPhoto} style={s.convoAvatar} /><View style={{ flex: 1 }}><Text style={s.convoName}>{item.name}</Text><Text style={s.last} numberOfLines={1}>{item.lastMessage?.text || 'Say hello and start a conversation'}</Text></View><Text style={s.time}>{item.lastMessage?.createdAt ? new Date(item.lastMessage.createdAt).toLocaleDateString() : ''}</Text></Pressable>) : <View style={s.emptyConvo}><Ionicons name="chatbubbles-outline" size={25} color="#D2A2A8" /><Text style={s.emptyText}>{hasApiConfiguration() ? 'Your conversations will appear here.' : 'Connect a backend to load your matches and saved conversations.'}</Text></View>}
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#FFF' }, content: { padding: 22, paddingTop: 19, paddingBottom: 35 }, kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.7, color: '#EF7180' }, title: { fontSize: 29, fontWeight: '800', color: '#28252C', marginTop: 5 }, sub: { fontSize: 14, color: '#89848B', marginTop: 4, marginBottom: 25 }, sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, marginTop: 8 }, section: { fontSize: 18, fontWeight: '800', color: '#332F36' }, count: { fontSize: 12, color: '#938D94' }, matchList: { gap: 16, paddingBottom: 18 }, match: { alignItems: 'center', width: 68 }, incoming: { alignItems: 'center', width: 76 }, avatar: { width: 62, height: 62, borderRadius: 23, borderWidth: 2, borderColor: '#F8D8DC' }, likeBack: { position: 'absolute', right: 1, top: 42, width: 27, height: 27, borderRadius: 14, backgroundColor: '#F16D7A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' }, matchName: { fontSize: 11, fontWeight: '700', color: '#49454C', marginTop: 6 }, emptyMatch: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, borderRadius: 20, backgroundColor: '#FFF6F6', marginBottom: 21 }, heart: { height: 42, width: 42, borderRadius: 16, backgroundColor: '#FFEDEF', alignItems: 'center', justifyContent: 'center' }, emptyTitle: { fontSize: 14, fontWeight: '800', color: '#3A363D' }, emptyText: { fontSize: 12, lineHeight: 18, color: '#89848B', marginTop: 4 }, convo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F3EFF0' }, convoAvatar: { height: 50, width: 50, borderRadius: 20 }, convoName: { fontWeight: '800', fontSize: 15, color: '#37333A' }, last: { color: '#89848B', fontSize: 12, marginTop: 4 }, time: { fontSize: 10, color: '#A8A2A8' }, emptyConvo: { alignItems: 'center', padding: 28, backgroundColor: '#FCFAFA', borderRadius: 20, gap: 9, marginTop: 8 } });
