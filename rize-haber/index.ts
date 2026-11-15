import { registerRootComponent } from 'expo';

// Arka plan bildirim görevi küresel kapsamda tanımlanmalı: uygulama kapalıyken
// Android görevi çalıştırdığında arayüz yüklenmeden önce bu dosya okunur.
import './src/notifications';
import App from './App';

registerRootComponent(App);
