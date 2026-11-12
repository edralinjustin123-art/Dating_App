import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { restoreSession } from '../lib/api';

export default function RootLayout() {
  const [ready,setReady]=useState(false);
  useEffect(()=>{const timer=setTimeout(()=>{restoreSession().catch(()=>{}).finally(()=>setReady(true));},0);return()=>clearTimeout(timer);},[]);
  if(!ready)return <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#FFF'}}><ActivityIndicator color="#EF7180"/></View>;
  return <><StatusBar style="dark" backgroundColor="#FFFFFF" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }} /></>;
}
